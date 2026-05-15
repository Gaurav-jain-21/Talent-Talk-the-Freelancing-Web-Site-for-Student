package com.talenttalk.interviewservice.repository;

import com.talenttalk.interviewservice.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByInterviewIdOrderByQuestionNumber(
            Long interviewId);
    List<InterviewQuestion> findByInterviewIdOrderByQuestionNumberAscIdAsc(
            Long interviewId);
    List<InterviewQuestion> findByInterviewIdAndQuestionNumberOrderByIdAsc(
            Long interviewId, Integer questionNumber);
}
