package com.talenttalk.communicationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private Long receiverId;

    private String senderName;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(columnDefinition = "boolean default false")
    private Boolean isRead;

    @CreationTimestamp
    private LocalDateTime sentAt;
}
