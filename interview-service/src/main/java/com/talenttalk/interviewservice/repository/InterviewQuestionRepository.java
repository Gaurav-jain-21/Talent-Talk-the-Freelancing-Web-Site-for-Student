package com.talenttalk.interviewservice.repository;

import com.talenttalk.interviewservice.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByInterviewIdOrderByQuestionNumber(
            Long interviewId);
    Optional<InterviewQuestion> findByInterviewIdAndQuestionNumber(
            Long interviewId, Integer questionNumber);
}