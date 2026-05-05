package com.talenttalk.interviewservice.dto;

import com.talenttalk.interviewservice.entity.Interview;
import com.talenttalk.interviewservice.entity.InterviewQuestion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResult {
    private Interview interview;
    private List<InterviewQuestion> questions;
}