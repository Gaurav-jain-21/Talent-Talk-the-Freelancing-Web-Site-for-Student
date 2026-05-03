package com.talenttalk.jobservice.repository;

import com.talenttalk.jobservice.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application,Long> {
    List<Application> findAllByJobId(Long jobId);
    List<Application> findAllByStudentId(Long studentId);
}
