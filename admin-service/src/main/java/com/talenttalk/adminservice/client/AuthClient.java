package com.talenttalk.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "AUTH-SERVICE")
public interface AuthClient {

    @DeleteMapping("/auth/internal/users/{userId}")
    void deleteUser(
            @PathVariable Long userId,
            @RequestHeader("X-Internal-Service") String internalService);
}
