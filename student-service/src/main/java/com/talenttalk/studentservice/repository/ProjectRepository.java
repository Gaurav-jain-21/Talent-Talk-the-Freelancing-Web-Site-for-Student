package com.talenttalk.studentservice.repository;

import com.talenttalk.studentservice.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project,Long> {

    List<Project> findByStudentId(Long studentId);
    void deleteByStudentId(Long studentId);
}
