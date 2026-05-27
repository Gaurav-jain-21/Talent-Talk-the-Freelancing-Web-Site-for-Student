package com.talenttalk.studentservice.repository;

import com.talenttalk.studentservice.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project,Long> {

    List<Project> findByStudentId(Long studentId);
    List<Project> findByStudentIdIn(List<Long> studentIds);
    void deleteByStudentId(Long studentId);
    void deleteByStudentIdIn(List<Long> studentIds);
}
