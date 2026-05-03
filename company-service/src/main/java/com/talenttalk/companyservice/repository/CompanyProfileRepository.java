package com.talenttalk.companyservice.repository;

import com.talenttalk.companyservice.entity.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {
    Optional<CompanyProfile> findByUserId(Long userId);
    boolean existsByEmail(String email);
}
