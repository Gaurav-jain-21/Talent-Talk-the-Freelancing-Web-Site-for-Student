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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final GeminiService geminiService;
    private final StudentClient studentClient;
    private final JobClient jobClient;

    // Company triggers interview for a student
    public Interview createInterview(InterviewRequest request) {

        // Step 1 — fetch job details from Job Service
        Map<String, Object> job = jobClient.getJobById(request.getJobId());

        // Step 2 — fetch student details from Student Service
        Map<String, Object> student = studentClient
                .getStudentProfile(request.getStudentId());

        // Step 3 — create interview record
        Interview interview = new Interview();
        interview.setJobId(request.getJobId());
        interview.setStudentId(request.getStudentId());
        interview.setCompanyId(request.getCompanyId());
        interview.setDeadline(request.getDeadline());
        interview.setStatus(InterviewStatus.PENDING);

        // Store job info
        interview.setJobTitle(
                job.getOrDefault("title", "").toString());
        interview.setJobDescription(
                job.getOrDefault("description", "").toString());
        interview.setSkillsRequired(
                job.getOrDefault("skillsRequired", "").toString());

        // Store student info
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

    // Student starts interview
    public InterviewResult startInterview(Long interviewId) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Interview not found"));

        // Check deadline
        if (LocalDateTime.now().isAfter(interview.getDeadline())) {
            interview.setStatus(InterviewStatus.EXPIRED);
            interviewRepository.save(interview);
            throw new RuntimeException(
                    "Interview deadline has passed");
        }

        // Check status
        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            throw new RuntimeException("Interview already completed");
        }

        // If first time starting — generate questions
        if (interview.getStatus() == InterviewStatus.PENDING) {

            // AI generates 7 questions
            List<String> questions = geminiService.generateQuestions(
                    interview.getJobTitle(),
                    interview.getJobDescription(),
                    interview.getSkillsRequired(),
                    interview.getStudentSkills(),
                    interview.getStudentBio(),
                    interview.getStudentProjects()
            );

            // Save each question with expected answer
            for (int i = 0; i < questions.size(); i++) {
                String question = questions.get(i);

                String expectedAnswer = geminiService
                        .generateExpectedAnswer(
                                question,
                                interview.getJobTitle(),
                                interview.getSkillsRequired()
                        );

                InterviewQuestion iq = new InterviewQuestion();
                iq.setInterviewId(interviewId);
                iq.setQuestionNumber(i + 1);
                iq.setQuestion(question);
                iq.setExpectedAnswer(expectedAnswer);
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

    // Student submits answer for a question
    public InterviewQuestion submitAnswer(AnswerRequest request) {

        Interview interview = interviewRepository
                .findById(request.getInterviewId())
                .orElseThrow(() -> new RuntimeException(
                        "Interview not found"));

        // Check deadline
        if (LocalDateTime.now().isAfter(interview.getDeadline())) {
            interview.setStatus(InterviewStatus.EXPIRED);
            interviewRepository.save(interview);
            throw new RuntimeException("Interview deadline has passed");
        }

        // Find the question
        InterviewQuestion question = questionRepository
                .findByInterviewIdAndQuestionNumber(
                        request.getInterviewId(),
                        request.getQuestionNumber())
                .orElseThrow(() -> new RuntimeException(
                        "Question not found"));

        // AI evaluates the answer
        Map<String, Object> evaluation = geminiService.evaluateAnswer(
                question.getQuestion(),
                question.getExpectedAnswer(),
                request.getAnswer(),
                interview.getJobTitle()
        );

        // Save student answer + score + feedback
        question.setStudentAnswer(request.getAnswer());
        question.setScore((Integer) evaluation.get("score"));
        question.setFeedback(evaluation.get("feedback").toString());

        questionRepository.save(question);

        // Check if all questions answered
        checkAndCompleteInterview(interview);

        return question;
    }

    // Check if all 7 questions answered and complete interview
    private void checkAndCompleteInterview(Interview interview) {

        List<InterviewQuestion> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumber(
                        interview.getId());

        boolean allAnswered = questions.stream()
                .allMatch(q -> q.getStudentAnswer() != null
                        && !q.getStudentAnswer().isEmpty());

        if (allAnswered && questions.size() == 7) {

            // Calculate total score (sum of all scores * 100/70)
            int totalRaw = questions.stream()
                    .mapToInt(q -> q.getScore() != null
                            ? q.getScore() : 0)
                    .sum();
            int totalScore = (int) Math.round(totalRaw * 100.0 / 70);

            // Generate summary
            List<String> qs = questions.stream()
                    .map(InterviewQuestion::getQuestion).toList();
            List<String> ans = questions.stream()
                    .map(InterviewQuestion::getStudentAnswer).toList();
            List<Integer> scores = questions.stream()
                    .map(InterviewQuestion::getScore).toList();

            Map<String, String> summary = geminiService.generateSummary(
                    interview.getJobTitle(),
                    interview.getStudentName(),
                    totalScore, qs, ans, scores
            );

            interview.setTotalScore(totalScore);
            interview.setGrade(geminiService.calculateGrade(totalScore));
            interview.setSummary(summary.get("summary"));
            interview.setRecommendation(summary.get("recommendation"));
            interview.setStatus(InterviewStatus.COMPLETED);
            interview.setCompletedAt(LocalDateTime.now());

            interviewRepository.save(interview);
        }
    }

    // Get next unanswered question for student
    public InterviewQuestion getNextQuestion(Long interviewId) {
        List<InterviewQuestion> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumber(interviewId);

        return questions.stream()
                .filter(q -> q.getStudentAnswer() == null
                        || q.getStudentAnswer().isEmpty())
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "All questions answered"));
    }

    // Company views full interview result
    public InterviewResult getInterviewResult(Long interviewId) {
        Interview interview = interviewRepository
                .findById(interviewId)
                .orElseThrow(() -> new RuntimeException(
                        "Interview not found"));

        List<InterviewQuestion> questions = questionRepository
                .findByInterviewIdOrderByQuestionNumber(interviewId);

        return new InterviewResult(interview, questions);
    }

    // Get all interviews for a student
    public List<Interview> getInterviewsByStudent(Long studentId) {
        return interviewRepository.findByStudentId(studentId);
    }

    // Get all interviews for a company
    public List<Interview> getInterviewsByCompany(Long companyId) {
        return interviewRepository.findByCompanyId(companyId);
    }

    // Get all interviews for a job
    public List<Interview> getInterviewsByJob(Long jobId) {
        return interviewRepository.findByJobId(jobId);
    }

    // Get pending interviews for student
    public List<Interview> getPendingInterviews(Long studentId) {
        return interviewRepository.findByStudentIdAndStatus(
                studentId, InterviewStatus.PENDING);
    }
}