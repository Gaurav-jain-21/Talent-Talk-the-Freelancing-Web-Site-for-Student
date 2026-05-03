package com.talenttalk.communicationservice.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private Long senderId;
    private Long receiverId;
    private String senderName;
    private String content;
}