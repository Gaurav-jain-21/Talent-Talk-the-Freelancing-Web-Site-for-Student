package com.talenttalk.communicationservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MessageRequest {

    @NotNull(message = "Sender ID cannot be null")
    private Long senderId;

    @NotNull(message = "Receiver ID cannot be null")
    private Long receiverId;

    @NotBlank(message = "Sender name cannot be blank")
    private String senderName;

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String content;
}