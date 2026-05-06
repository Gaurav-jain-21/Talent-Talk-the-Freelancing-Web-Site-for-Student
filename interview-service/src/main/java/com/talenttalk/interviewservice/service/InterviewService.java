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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final OllamaService ollamaService;
    private final StudentClient studentClient;
    private final JobClient jobClient;

    // Company creates interview for student
    public Interview createInterview(InterviewRequest request) {

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

        interview.setJobTitle(
                job.getOrDefault("title", "").toString());
        interview.setJobDescription(
                job.getOrDefault("description", "").toString());
        interview.setSkillsRequired(
                job.getOrDefault("skillsRequired", "").toString());
        interview.setStudentName(
                student.getOrDefault("fullName", "").toString());
        interview.setStudentSkills(
                student.getOrDefault("skills", "").toString());
        interview.setStudentBio(
                student.getOrDefault("bio", "").toString());
        interview.setStudentProjects(
                student.getOrDefault("githubUrl", "").toString());

        return interviewRepository.save(interview);
    }

    // Student starts — ONE Ollama call generates all questions
    public InterviewResult startInterview(Long interviewId) {

        Interview interview = interviewRepository
                .findById(interviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Interview not found"));

        if (LocalDateTime.now().isAfter(interview.getDeadline())) {
            interview.setStatus(InterviewStatus.EXPIRED);
            interviewRepository.save(interview);
            throw new RuntimeException("Interview deadline has passed");
        }

        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            throw new RuntimeException("Interview already completed");
        }

        if (interview.getStatus() == InterviewStatus.PENDING) {

            // ONE Ollama call — all 7 Q+A
            List<Map<String, String>> questionsWithAnswers =
                    ollamaService.generateQuestionsWithAnswers(
                            interview.getJobTitle(),
                            interview.getJobDescription(),
                            interview.getSkillsRequired(),
                            interview.getStudentSkills(),
                            interview.getStudentBio(),
                            interview.getStudentProjects()
                    );

            for (int i = 0; i < questionsWithAnswers.size(); i++) {
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

        List<InterviewQuestion> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumber(interviewId);

        return new InterviewResult(interview, questions);
    }

    // Student submits answer — NO AI call, just saves
    public InterviewQuestion submitAnswer(AnswerRequest request) {

        Interview interview = interviewRepository
                .findById(request.getInterviewId())
                .orElseThrow(() -> new RuntimeException(
                        "Interview not found"));

        if (LocalDateTime.now().isAfter(interview.getDeadline())) {
            interview.setStatus(InterviewStatus.EXPIRED);
            interviewRepository.save(interview);
            throw new RuntimeException("Interview deadline has passed");
        }

        InterviewQuestion question = questionRepository
                .findByInterviewIdAndQuestionNumber(
                        request.getInterviewId(),
                        request.getQuestionNumber())
                .orElseThrow(() -> new RuntimeException(
                        "Question not found"));

        question.setStudentAnswer(request.getAnswer());
        questionRepository.save(question);

        // Evaluate everything when last answer submitted
        checkAndCompleteInterview(interview);

        return question;
    }

    // Evaluates when all 7 answers are in — ONE Ollama call
    private void checkAndCompleteInterview(Interview interview) {

        List<InterviewQuestion> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumber(
                        interview.getId());

        boolean allAnswered = questions.stream()
                .allMatch(q -> q.getStudentAnswer() != null
                        && !q.getStudentAnswer().isEmpty());

        if (allAnswered && questions.size() == 7) {

            List<String> qs = questions.stream()
                    .map(InterviewQuestion::getQuestion).toList();
            List<String> expectedAnswers = questions.stream()
                    .map(InterviewQuestion::getExpectedAnswer).toList();
            List<String> studentAnswers = questions.stream()
                    .map(InterviewQuestion::getStudentAnswer).toList();

            // ONE Ollama call — evaluate all + summary
            Map<String, Object> evaluation =
                    ollamaService.evaluateAllAnswers(
                            interview.getJobTitle(),
                            interview.getStudentName(),
                            qs,
                            expectedAnswers,
                            studentAnswers
                    );

            List<Integer> scores =
                    (List<Integer>) evaluation.get("scores");
            List<String> feedbacks =
                    (List<String>) evaluation.get("feedbacks");

            for (int i = 0; i < questions.size(); i++) {
                InterviewQuestion q = questions.get(i);
                q.setScore(i < scores.size() ? scores.get(i) : 5);
                q.setFeedback(i < feedbacks.size()
                        ? feedbacks.get(i) : "Evaluated.");
                questionRepository.save(q);
            }

            int totalRaw = scores.stream()
                    .mapToInt(Integer::intValue).sum();
            int totalScore = (int) Math.round(totalRaw * 100.0 / 70);
            totalScore = Math.min(100, totalScore);

            interview.setTotalScore(totalScore);
            interview.setGrade(ollamaService.calculateGrade(totalScore));
            interview.setSummary(evaluation.get("summary").toString());
            interview.setRecommendation(
                    evaluation.get("recommendation").toString());
            interview.setStatus(InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());

            interviewRepository.save(interview);
        }
    }

    public InterviewQuestion getNextQuestion(Long interviewId) {
        return questionRepository
                .findByInterviewIdOrderByQuestionNumber(interviewId)
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
        List<InterviewQuestion> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumber(interviewId);
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
        return interviewRepository.findByStudentIdAndStatus(
                studentId, InterviewStatus.PENDING);
    }
}