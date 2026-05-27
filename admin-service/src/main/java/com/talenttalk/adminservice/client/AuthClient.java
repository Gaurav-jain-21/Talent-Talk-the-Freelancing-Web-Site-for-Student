package com.talenttalk.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

@FeignClient(name = "AUTH-SERVICE")
public interface AuthClient {

    @DeleteMapping("/auth/internal/users/{userId}")
    void deleteUser(
            @PathVariable Long userId,
            @RequestHeader("X-Internal-Service") String internalService);

    @GetMapping("/auth/internal/users")
    List<Map<String, Object>> getUsersByRole(
            @RequestParam String role,
            @RequestHeader("X-Internal-Service") String internalService);
}
