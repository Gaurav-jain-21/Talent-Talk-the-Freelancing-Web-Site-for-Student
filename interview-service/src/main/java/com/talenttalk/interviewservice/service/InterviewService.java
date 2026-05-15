package com.talenttalk.interviewservice.service;

import com.talenttalk.interviewservice.client.JobClient;
import com.talenttalk.interviewservice.client.StudentClient;
import com.talenttalk.interviewservice.dto.AnswerRequest;
import com.talenttalk.interviewservice.dto.InterviewRequest;
import com.talenttalk.interviewservice.dto.InterviewResult;
import com.talenttalk.interviewservice.entity.Interview;
import com.talenttalk.interviewservice.entity.InterviewQuestion;
import com.talenttalk.interviewservice.entity.InterviewStatus;
import com.talenttalk.interviewservice.repository.InterviewQuestionRepository;
import com.talenttalk.interviewservice.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class InterviewService {

    private static final int TOTAL_QUESTIONS = 10;

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final OllamaService ollamaService;
    private final StudentClient studentClient;
    private final JobClient jobClient;

    // Company creates interview for student
    public Interview createInterview(InterviewRequest request) {
        if (request.getJobId() == null
                || request.getStudentId() == null
                || request.getCompanyId() == null) {
            throw new RuntimeException(
                    "Job, student, and company are required to schedule an interview");
        }

        if (request.getDeadline() == null) {
            throw new RuntimeException("Interview deadline is required");
        }

        Map<String, Object> job =
                jobClient.getJobById(request.getJobId());
        Map<String, Object> student =
                studentClient.getStudentProfile(request.getStudentId());

        Interview interview = new Interview();
        interview.setJobId(request.getJobId());
        interview.setStudentId(request.getStudentId());
        interview.setCompanyId(request.getCompanyId());
        interview.setDeadline(request.getDeadline());
        interview.setStatus(InterviewStatus.PENDING);

        interview.setJobTitle(text(job, "title"));
        interview.setJobDescription(text(job, "description"));
        interview.setSkillsRequired(text(job, "skillsRequired"));
        interview.setStudentName(text(student, "fullName"));
        interview.setStudentSkills(text(student, "skills"));
        interview.setStudentBio(text(student, "bio"));
        interview.setStudentProjects(text(student, "githubUrl"));

        return interviewRepository.save(interview);
    }

    // Student starts — ONE Ollama call generates all questions
    public InterviewResult startInterview(Long interviewId) {

        Interview interview = interviewRepository
                .findById(interviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Interview not found"));

        if (isDeadlinePassed(interview)) {
            interview.setStatus(InterviewStatus.EXPIRED);
            interviewRepository.save(interview);
            throw new RuntimeException("Interview deadline has passed");
        }

        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            return getInterviewResult(interviewId);
        }

        if (interview.getStatus() == InterviewStatus.PENDING) {
            List<InterviewQuestion> existingQuestions =
                    canonicalQuestions(interviewId);
            if (!existingQuestions.isEmpty()) {
                interview.setStatus(InterviewStatus.IN_PROGRESS);
                if (interview.getStartedAt() == null) {
                    interview.setStartedAt(LocalDateTime.now());
                }
                interviewRepository.save(interview);
                return new InterviewResult(
                        interview,
                        ensureQuestionCount(interview, existingQuestions));
            }

            // ONE Ollama call generates the full interview set.
            List<Map<String, String>> questionsWithAnswers;
            try {
                questionsWithAnswers =
                        ollamaService.generateQuestionsWithAnswers(
                                interview.getJobTitle(),
                                interview.getJobDescription(),
                                interview.getSkillsRequired(),
                                interview.getStudentSkills(),
                                interview.getStudentBio(),
                                interview.getStudentProjects()
                        );
            } catch (Exception ex) {
                questionsWithAnswers =
                        ollamaService.fallbackQuestionsWithAnswers(
                                interview.getJobTitle(),
                                interview.getSkillsRequired());
            }

            for (int i = 0; i < Math.min(TOTAL_QUESTIONS, questionsWithAnswers.size()); i++) {
                Map<String, String> qa = questionsWithAnswers.get(i);
                InterviewQuestion iq = new InterviewQuestion();
                iq.setInterviewId(interviewId);
                iq.setQuestionNumber(i + 1);
                iq.setQuestion(qa.get("question"));
                iq.setExpectedAnswer(qa.get("expectedAnswer"));
                questionRepository.save(iq);
            }

            interview.setStatus(InterviewStatus.IN_PROGRESS);
            interview.setStartedAt(LocalDateTime.now());
            interviewRepository.save(interview);
        }

        List<InterviewQuestion> questions =
                ensureQuestionCount(interview, canonicalQuestions(interviewId));

        return new InterviewResult(interview, questions);
    }

    // Student submits answer — NO AI call, just saves
    public InterviewQuestion submitAnswer(AnswerRequest request) {

        Interview interview = interviewRepository
                .findById(request.getInterviewId())
                .orElseThrow(() -> new RuntimeException(
                        "Interview not found"));

        if (isDeadlinePassed(interview)) {
            interview.setStatus(InterviewStatus.EXPIRED);
            interviewRepository.save(interview);
            throw new RuntimeException("Interview deadline has passed");
        }

        InterviewQuestion question = canonicalQuestion(
                request.getInterviewId(),
                request.getQuestionNumber());

        question.setStudentAnswer(request.getAnswer());
        questionRepository.save(question);

        // Evaluate everything when last answer submitted
        checkAndCompleteInterview(interview);

        return question;
    }

    // Evaluates when all answers are in.
    private void checkAndCompleteInterview(Interview interview) {

        List<InterviewQuestion> questions = ensureQuestionCount(
                interview,
                canonicalQuestions(interview.getId()));

        boolean allAnswered = questions.stream()
                .allMatch(q -> q.getStudentAnswer() != null
                        && !q.getStudentAnswer().isEmpty());

        if (allAnswered && questions.size() == TOTAL_QUESTIONS) {

            List<String> qs = questions.stream()
                    .map(InterviewQuestion::getQuestion).toList();
            List<String> expectedAnswers = questions.stream()
                    .map(InterviewQuestion::getExpectedAnswer).toList();
            List<String> studentAnswers = questions.stream()
                    .map(InterviewQuestion::getStudentAnswer).toList();

            // ONE Ollama call — evaluate all + summary
            Map<String, Object> evaluation;
            try {
                evaluation =
                        ollamaService.evaluateAllAnswers(
                                interview.getJobTitle(),
                                interview.getStudentName(),
                                qs,
                                expectedAnswers,
                                studentAnswers
                        );
            } catch (Exception ex) {
                evaluation = ollamaService.fallbackEvaluation(
                        questions.size());
            }

            List<Integer> scores =
                    safeScores(evaluation.get("scores"), questions.size());
            List<String> feedbacks =
                    safeFeedbacks(evaluation.get("feedbacks"),
                            questions.size());

            for (int i = 0; i < questions.size(); i++) {
                InterviewQuestion q = questions.get(i);
                q.setScore(i < scores.size() ? scores.get(i) : 5);
                q.setFeedback(i < feedbacks.size()
                        ? feedbacks.get(i) : "Evaluated.");
                questionRepository.save(q);
            }

            int totalRaw = scores.stream()
                    .mapToInt(Integer::intValue).sum();
            int maxScore = Math.max(1, questions.size() * 10);
            int totalScore = (int) Math.round(totalRaw * 100.0 / maxScore);
            totalScore = Math.min(100, totalScore);

            interview.setTotalScore(totalScore);
            interview.setGrade(ollamaService.calculateGrade(totalScore));
            interview.setSummary(valueOrDefault(
                    evaluation.get("summary"), "Evaluation completed."));
            interview.setRecommendation(valueOrDefault(
                    evaluation.get("recommendation"), "PENDING"));
            interview.setStatus(InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());

            interviewRepository.save(interview);
        }
    }

    public InterviewQuestion getNextQuestion(Long interviewId) {
        Interview interview = interviewRepository
                .findById(interviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Interview not found"));
        return ensureQuestionCount(interview, canonicalQuestions(interviewId))
                .stream()
                .filter(q -> q.getStudentAnswer() == null
                        || q.getStudentAnswer().isEmpty())
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "All questions answered"));
    }

    public InterviewResult getInterviewResult(Long interviewId) {
        Interview interview = interviewRepository
                .findById(interviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Interview not found"));
        List<InterviewQuestion> questions =
                ensureQuestionCount(interview, canonicalQuestions(interviewId));
        return new InterviewResult(interview, questions);
    }

    public List<Interview> getInterviewsByStudent(Long studentId) {
        return interviewRepository.findByStudentId(studentId);
    }

    public List<Interview> getInterviewsByCompany(Long companyId) {
        return interviewRepository.findByCompanyId(companyId);
    }

    public List<Interview> getInterviewsByJob(Long jobId) {
        return interviewRepository.findByJobId(jobId);
    }

    public List<Interview> getPendingInterviews(Long studentId) {
        return interviewRepository.findByStudentIdAndStatusIn(
                studentId,
                List.of(InterviewStatus.PENDING,
                        InterviewStatus.IN_PROGRESS));
    }

    private InterviewQuestion canonicalQuestion(
            Long interviewId,
            Integer questionNumber) {
        List<InterviewQuestion> matches = questionRepository
                .findByInterviewIdAndQuestionNumberOrderByIdAsc(
                        interviewId, questionNumber);
        if (matches.isEmpty()) {
            throw new RuntimeException("Question not found");
        }
        return mergeDuplicateQuestions(matches);
    }

    private List<InterviewQuestion> canonicalQuestions(Long interviewId) {
        List<InterviewQuestion> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumberAscIdAsc(interviewId);
        Map<Integer, List<InterviewQuestion>> grouped =
                new LinkedHashMap<>();
        for (InterviewQuestion question : questions) {
            grouped.computeIfAbsent(
                    question.getQuestionNumber(),
                    key -> new ArrayList<>()).add(question);
        }

        List<InterviewQuestion> canonical = new ArrayList<>();
        for (List<InterviewQuestion> matches : grouped.values()) {
            canonical.add(mergeDuplicateQuestions(matches));
        }

        if (canonical.size() > TOTAL_QUESTIONS) {
            List<InterviewQuestion> extras =
                    new ArrayList<>(canonical.subList(
                            TOTAL_QUESTIONS, canonical.size()));
            questionRepository.deleteAll(extras);
            canonical = new ArrayList<>(canonical.subList(
                    0, TOTAL_QUESTIONS));
        }
        return canonical;
    }

    private List<InterviewQuestion> ensureQuestionCount(
            Interview interview,
            List<InterviewQuestion> questions) {
        if (questions.size() >= TOTAL_QUESTIONS) {
            return questions;
        }

        List<Map<String, String>> fallbackQuestions =
                ollamaService.fallbackQuestionsWithAnswers(
                        interview.getJobTitle(),
                        interview.getSkillsRequired());

        for (int questionNumber = 1; questionNumber <= TOTAL_QUESTIONS; questionNumber++) {
            if (hasQuestionNumber(questions, questionNumber)) {
                continue;
            }
            Map<String, String> qa = fallbackQuestions.get(
                    (questionNumber - 1) % fallbackQuestions.size());
            InterviewQuestion question = new InterviewQuestion();
            question.setInterviewId(interview.getId());
            question.setQuestionNumber(questionNumber);
            question.setQuestion(valueOrDefault(
                    qa.get("question"),
                    "Describe your experience with relevant technologies."));
            question.setExpectedAnswer(valueOrDefault(
                    qa.get("expectedAnswer"),
                    "Candidate should demonstrate practical knowledge."));
            questionRepository.save(question);
        }

        return canonicalQuestions(interview.getId());
    }

    private boolean hasQuestionNumber(
            List<InterviewQuestion> questions,
            int questionNumber) {
        return questions.stream()
                .anyMatch(question -> question.getQuestionNumber() != null
                        && question.getQuestionNumber() == questionNumber);
    }

    private InterviewQuestion mergeDuplicateQuestions(
            List<InterviewQuestion> matches) {
        InterviewQuestion keeper = matches.get(0);
        List<InterviewQuestion> duplicates = new ArrayList<>();

        for (int i = 1; i < matches.size(); i++) {
            InterviewQuestion duplicate = matches.get(i);
            copyMissingQuestionData(keeper, duplicate);
            duplicates.add(duplicate);
        }

        if (!duplicates.isEmpty()) {
            questionRepository.save(keeper);
            questionRepository.deleteAll(duplicates);
        }

        return keeper;
    }

    private void copyMissingQuestionData(
            InterviewQuestion target,
            InterviewQuestion source) {
        if (blank(target.getQuestion()) && !blank(source.getQuestion())) {
            target.setQuestion(source.getQuestion());
        }
        if (blank(target.getExpectedAnswer())
                && !blank(source.getExpectedAnswer())) {
            target.setExpectedAnswer(source.getExpectedAnswer());
        }
        if (blank(target.getStudentAnswer())
                && !blank(source.getStudentAnswer())) {
            target.setStudentAnswer(source.getStudentAnswer());
        }
        if (target.getScore() == null && source.getScore() != null) {
            target.setScore(source.getScore());
        }
        if (blank(target.getFeedback()) && !blank(source.getFeedback())) {
            target.setFeedback(source.getFeedback());
        }
    }

    private boolean isDeadlinePassed(Interview interview) {
        return interview.getDeadline() != null
                && LocalDateTime.now().isAfter(interview.getDeadline());
    }

    private String text(Map<String, Object> values, String key) {
        if (values == null) {
            return "";
        }
        Object value = values.get(key);
        return value == null ? "" : value.toString();
    }

    private String valueOrDefault(Object value, String fallback) {
        return value == null ? fallback : value.toString();
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private List<Integer> safeScores(Object value, int count) {
        List<Integer> scores = new ArrayList<>();
        if (value instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof Number number) {
                    scores.add(Math.max(0,
                            Math.min(10, number.intValue())));
                } else {
                    try {
                        scores.add(Math.max(0,
                                Math.min(10, Integer.parseInt(
                                        item.toString()))));
                    } catch (Exception ignored) {
                        scores.add(5);
                    }
                }
            }
        }
        while (scores.size() < count) {
            scores.add(5);
        }
        return scores;
    }

    private List<String> safeFeedbacks(Object value, int count) {
        List<String> feedbacks = new ArrayList<>();
        if (value instanceof List<?> list) {
            for (Object item : list) {
                feedbacks.add(valueOrDefault(item, "Answer noted."));
            }
        }
        while (feedbacks.size() < count) {
            feedbacks.add("Answer noted.");
        }
        return feedbacks;
    }
}
