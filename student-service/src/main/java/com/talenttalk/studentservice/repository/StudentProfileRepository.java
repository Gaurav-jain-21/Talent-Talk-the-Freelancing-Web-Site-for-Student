package com.talenttalk.studentservice.repository;

import com.talenttalk.studentservice.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile,Long> {

    Optional<StudentProfile> findByUserId(Long userId);
}
