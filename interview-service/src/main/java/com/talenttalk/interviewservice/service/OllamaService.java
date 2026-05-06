package com.talenttalk.interviewservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class OllamaService {

    @Value("${ollama.api.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Core method — calls local Ollama
    private String callOllama(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false); // get full response at once

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ollamaUrl, entity, Map.class);

            if (response.getBody() != null) {
                return response.getBody()
                        .get("response").toString().trim();
            }
        } catch (Exception e) {
            throw new RuntimeException(
                    "Ollama error: " + e.getMessage()
                            + " — Make sure Ollama is running: ollama serve");
        }
        throw new RuntimeException("Empty response from Ollama");
    }

    // Generate 7 questions + expected answers in ONE call
    public List<Map<String, String>> generateQuestionsWithAnswers(
            String jobTitle,
            String jobDescription,
            String skillsRequired,
            String studentSkills,
            String studentBio,
            String studentProjects) {

        String prompt = """
                You are an expert technical interviewer.
                
                Job Details:
                Title: %s
                Description: %s
                Skills Required: %s
                
                Candidate Profile:
                Skills: %s
                Bio: %s
                Projects: %s
                
                Generate exactly 7 interview questions with ideal answers.
                Mix technical and behavioral questions.
                Make them relevant to both the job and candidate background.
                Progressive difficulty from easy to hard.
                
                Return ONLY in this exact format, no other text:
                Q1: <question here>
                A1: <ideal answer here>
                Q2: <question here>
                A2: <ideal answer here>
                Q3: <question here>
                A3: <ideal answer here>
                Q4: <question here>
                A4: <ideal answer here>
                Q5: <question here>
                A5: <ideal answer here>
                Q6: <question here>
                A6: <ideal answer here>
                Q7: <question here>
                A7: <ideal answer here>
                """.formatted(
                jobTitle, jobDescription, skillsRequired,
                studentSkills, studentBio, studentProjects
        );

        String response = callOllama(prompt);
        return parseQuestionsAndAnswers(response);
    }

    // Evaluate all answers + generate summary in ONE call
    public Map<String, Object> evaluateAllAnswers(
            String jobTitle,
            String studentName,
            List<String> questions,
            List<String> expectedAnswers,
            List<String> studentAnswers) {

        StringBuilder qa = new StringBuilder();
        for (int i = 0; i < questions.size(); i++) {
            qa.append("Q").append(i + 1).append(": ")
                    .append(questions.get(i)).append("\n");
            qa.append("Expected: ")
                    .append(expectedAnswers.get(i)).append("\n");
            qa.append("Candidate: ")
                    .append(studentAnswers.get(i)).append("\n\n");
        }

        String prompt = """
                You are an expert technical interviewer.
                
                Candidate: %s
                Job: %s
                
                Interview Q&A:
                %s
                
                Evaluate each answer. Consider technical accuracy,
                relevance, depth, and communication.
                
                Return ONLY in this exact format, no other text:
                SCORE1: <0-10>
                FEEDBACK1: <one sentence>
                SCORE2: <0-10>
                FEEDBACK2: <one sentence>
                SCORE3: <0-10>
                FEEDBACK3: <one sentence>
                SCORE4: <0-10>
                FEEDBACK4: <one sentence>
                SCORE5: <0-10>
                FEEDBACK5: <one sentence>
                SCORE6: <0-10>
                FEEDBACK6: <one sentence>
                SCORE7: <0-10>
                FEEDBACK7: <one sentence>
                SUMMARY: <2-3 sentence overall summary>
                STRONG: <strong areas>
                WEAK: <weak areas>
                RECOMMENDATION: <RECOMMENDED or NOT_RECOMMENDED>
                """.formatted(studentName, jobTitle, qa.toString());

        String response = callOllama(prompt);
        return parseEvaluation(response);
    }

    // Parse Q1/A1 format
    private List<Map<String, String>> parseQuestionsAndAnswers(
            String response) {

        List<Map<String, String>> result = new ArrayList<>();
        String[] lines = response.split("\n");

        String currentQuestion = "";
        String currentAnswer = "";

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            if (line.matches("^Q\\d+:.*")) {
                currentQuestion = line
                        .replaceFirst("^Q\\d+:\\s*", "").trim();
            } else if (line.matches("^A\\d+:.*")) {
                currentAnswer = line
                        .replaceFirst("^A\\d+:\\s*", "").trim();
                if (!currentQuestion.isEmpty()
                        && !currentAnswer.isEmpty()) {
                    Map<String, String> qa = new HashMap<>();
                    qa.put("question", currentQuestion);
                    qa.put("expectedAnswer", currentAnswer);
                    result.add(qa);
                    currentQuestion = "";
                    currentAnswer = "";
                }
            }
        }

        // Ensure we always have 7 questions
        while (result.size() < 7) {
            Map<String, String> qa = new HashMap<>();
            qa.put("question",
                    "Describe your experience with relevant technologies");
            qa.put("expectedAnswer",
                    "Candidate should demonstrate practical knowledge");
            result.add(qa);
        }

        return result;
    }

    // Parse evaluation response
    private Map<String, Object> parseEvaluation(String response) {
        List<Integer> scores = new ArrayList<>();
        List<String> feedbacks = new ArrayList<>();
        String summary = "Interview completed.";
        String strong = "Good overall performance";
        String weak = "Some areas need improvement";
        String recommendation = "NOT_RECOMMENDED";

        String[] lines = response.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            if (line.matches("^SCORE\\d+:.*")) {
                try {
                    String scoreStr = line
                            .replaceFirst("^SCORE\\d+:\\s*", "")
                            .trim()
                            .replaceAll("[^0-9]", "");
                    int score = scoreStr.isEmpty()
                            ? 5 : Integer.parseInt(scoreStr);
                    scores.add(Math.min(10, Math.max(0, score)));
                } catch (Exception e) {
                    scores.add(5);
                }
            } else if (line.matches("^FEEDBACK\\d+:.*")) {
                feedbacks.add(line
                        .replaceFirst("^FEEDBACK\\d+:\\s*", "")
                        .trim());
            } else if (line.startsWith("SUMMARY:")) {
                summary = line.replace("SUMMARY:", "").trim();
            } else if (line.startsWith("STRONG:")) {
                strong = line.replace("STRONG:", "").trim();
            } else if (line.startsWith("WEAK:")) {
                weak = line.replace("WEAK:", "").trim();
            } else if (line.startsWith("RECOMMENDATION:")) {
                String rec = line
                        .replace("RECOMMENDATION:", "").trim()
                        .toUpperCase();
                recommendation = rec.contains("NOT")
                        ? "NOT_RECOMMENDED" : "RECOMMENDED";
            }
        }

        // Fill defaults if parsing missed anything
        while (scores.size() < 7) scores.add(5);
        while (feedbacks.size() < 7) feedbacks.add("Answer noted.");

        Map<String, Object> result = new HashMap<>();
        result.put("scores", scores);
        result.put("feedbacks", feedbacks);
        result.put("summary", summary
                + " Strong: " + strong
                + ". Improve: " + weak);
        result.put("recommendation", recommendation);

        return result;
    }

    // Grade calculator
    public String calculateGrade(int score) {
        if (score >= 90) return "A+";
        if (score >= 80) return "A";
        if (score >= 70) return "B+";
        if (score >= 60) return "B";
        if (score >= 50) return "C";
        return "F";
    }
}