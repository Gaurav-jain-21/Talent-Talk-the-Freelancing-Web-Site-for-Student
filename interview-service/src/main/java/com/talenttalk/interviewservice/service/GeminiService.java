package com.talenttalk.interviewservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient = WebClient.create();

    // Call Gemini API with a prompt
    private String callGemini(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        Map response = webClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        // Extract text from Gemini response
        List candidates = (List) response.get("candidates");
        Map candidate = (Map) candidates.get(0);
        Map content = (Map) candidate.get("content");
        List parts = (List) content.get("parts");
        Map part = (Map) parts.get(0);
        return part.get("text").toString();
    }

    // Generate 7 interview questions based on job + student profile
    public List<String> generateQuestions(
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
                
                Generate exactly 7 interview questions for this candidate.
                Questions should be:
                1. Based on the job requirements
                2. Tailored to the candidate's background
                3. Mix of technical and behavioral questions
                4. Progressive difficulty (easy to hard)
                5. Relevant to real work scenarios
                
                Return ONLY the questions as a numbered list.
                Format:
                1. Question one
                2. Question two
                ...and so on
                
                Do not include any other text.
                """.formatted(
                jobTitle, jobDescription, skillsRequired,
                studentSkills, studentBio, studentProjects
        );

        String response = callGemini(prompt);

        // Parse numbered list into List<String>
        String[] lines = response.split("\n");
        List<String> questions = new java.util.ArrayList<>();
        for (String line : lines) {
            line = line.trim();
            if (line.matches("^\\d+\\..*")) {
                // Remove number prefix like "1. "
                questions.add(line.replaceFirst("^\\d+\\.\\s*", ""));
            }
        }
        return questions;
    }

    // Generate expected answer for a question
    public String generateExpectedAnswer(String question,
                                         String jobTitle, String skillsRequired) {

        String prompt = """
                You are an expert technical interviewer.
                
                Job: %s
                Skills Required: %s
                Question: %s
                
                Provide the ideal answer for this interview question.
                Keep it concise but comprehensive (3-5 sentences).
                Focus on key technical concepts and best practices.
                
                Return ONLY the ideal answer, no other text.
                """.formatted(jobTitle, skillsRequired, question);

        return callGemini(prompt);
    }

    // Evaluate student answer and give score
    public Map<String, Object> evaluateAnswer(
            String question,
            String expectedAnswer,
            String studentAnswer,
            String jobTitle) {

        String prompt = """
                You are an expert technical interviewer evaluating
                a candidate's answer.
                
                Job: %s
                Question: %s
                Ideal Answer: %s
                Candidate's Answer: %s
                
                Evaluate the candidate's answer and provide:
                1. Score out of 10
                2. Brief feedback (2-3 sentences)
                
                Consider:
                - Technical accuracy
                - Relevance to the question
                - Depth of knowledge
                - Communication clarity
                
                Return ONLY in this exact format:
                SCORE: <number>
                FEEDBACK: <your feedback>
                """.formatted(
                jobTitle, question, expectedAnswer, studentAnswer
        );

        String response = callGemini(prompt);

        // Parse score and feedback
        int score = 5; // default
        String feedback = "No feedback available";

        String[] lines = response.split("\n");
        for (String line : lines) {
            if (line.startsWith("SCORE:")) {
                try {
                    score = Integer.parseInt(
                            line.replace("SCORE:", "").trim());
                } catch (Exception e) {
                    score = 5;
                }
            }
            if (line.startsWith("FEEDBACK:")) {
                feedback = line.replace("FEEDBACK:", "").trim();
            }
        }

        return Map.of("score", score, "feedback", feedback);
    }

    // Generate overall interview summary
    public Map<String, String> generateSummary(
            String jobTitle,
            String studentName,
            int totalScore,
            List<String> questions,
            List<String> answers,
            List<Integer> scores) {

        String prompt = """
                You are an expert technical interviewer.
                
                Candidate: %s
                Job: %s
                Total Score: %d/100
                
                Interview Summary:
                %s
                
                Based on this interview provide:
                1. Overall summary (3-4 sentences)
                2. Strong areas
                3. Weak areas
                4. Recommendation: RECOMMENDED or NOT_RECOMMENDED
                
                Return ONLY in this exact format:
                SUMMARY: <overall summary>
                STRONG: <strong areas>
                WEAK: <weak areas>
                RECOMMENDATION: <RECOMMENDED or NOT_RECOMMENDED>
                """.formatted(
                studentName, jobTitle, totalScore,
                buildQAString(questions, answers, scores)
        );

        String response = callGemini(prompt);

        String summary = "";
        String strong = "";
        String weak = "";
        String recommendation = "NOT_RECOMMENDED";

        String[] lines = response.split("\n");
        for (String line : lines) {
            if (line.startsWith("SUMMARY:"))
                summary = line.replace("SUMMARY:", "").trim();
            if (line.startsWith("STRONG:"))
                strong = line.replace("STRONG:", "").trim();
            if (line.startsWith("WEAK:"))
                weak = line.replace("WEAK:", "").trim();
            if (line.startsWith("RECOMMENDATION:"))
                recommendation = line.replace("RECOMMENDATION:", "").trim();
        }

        return Map.of(
                "summary", summary + " Strong: " + strong
                        + " Weak: " + weak,
                "recommendation", recommendation
        );
    }

    private String buildQAString(List<String> questions,
                                 List<String> answers, List<Integer> scores) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < questions.size(); i++) {
            sb.append("Q").append(i + 1).append(": ")
                    .append(questions.get(i)).append("\n");
            sb.append("A: ").append(answers.get(i)).append("\n");
            sb.append("Score: ").append(scores.get(i)).append("/10\n\n");
        }
        return sb.toString();
    }

    // Calculate grade from score
    public String calculateGrade(int score) {
        if (score >= 90) return "A+";
        if (score >= 80) return "A";
        if (score >= 70) return "B+";
        if (score >= 60) return "B";
        if (score >= 50) return "C";
        return "F";
    }
}