// InterviewRepository.java
package com.talenttalk.interviewservice.repository;

import com.talenttalk.interviewservice.entity.Interview;
import com.talenttalk.interviewservice.entity.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    List<Interview> findByStudentId(Long studentId);
    List<Interview> findByCompanyId(Long companyId);
    List<Interview> findByJobId(Long jobId);
    List<Interview> findByStudentIdAndStatus(
            Long studentId, InterviewStatus status);
}