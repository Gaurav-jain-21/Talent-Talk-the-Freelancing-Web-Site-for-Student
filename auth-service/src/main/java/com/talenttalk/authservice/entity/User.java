package com.talenttalk.authservice.entity;

import jakarta.persistence.*;
import jdk.jfr.Name;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true, nullable=false)
    private String email;
    @Column(nullable=false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;


}
