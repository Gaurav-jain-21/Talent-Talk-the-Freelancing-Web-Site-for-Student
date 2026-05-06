package com.talenttalk.interviewservice.dto;

import lombok.Data;

@Data
public class AnswerRequest {
    private Long interviewId;
    private Integer questionNumber;
    private String answer;
}
