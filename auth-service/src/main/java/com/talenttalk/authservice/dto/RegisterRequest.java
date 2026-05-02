package com.talenttalk.authservice.dto;

import com.talenttalk.authservice.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
