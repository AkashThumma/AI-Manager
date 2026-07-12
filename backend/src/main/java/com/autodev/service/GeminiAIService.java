package com.autodev.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAIService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generatePostFromCommit(String commitMessage, String repoName, String platform, com.autodev.entity.User user) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("YOUR_GEMINI_API_KEY")) {
            logger.warn("No valid Gemini API key found. Returning mock generated post.");
            return generateMockPost(commitMessage, repoName, platform, user);
        }

        String prompt = buildPrompt(commitMessage, repoName, platform, user);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Constructing the Gemini API request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                    Map.of("parts", List.of(
                            Map.of("text", prompt)
                    ))
            ));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Make the HTTP request
            Map<String, Object> response = restTemplate.postForObject(
                    apiUrl + "?key=" + apiKey,
                    entity,
                    Map.class
            );

            // Extract the generated text from the response
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Failed to parse response from Gemini API.";

        } catch (Exception e) {
            logger.error("Error calling Gemini API: {}", e.getMessage());
            return generateMockPost(commitMessage, repoName, platform, user);
        }
    }

    private String buildPrompt(String commitMessage, String repoName, String platform, com.autodev.entity.User user) {
        String tone = user != null && user.getAiTone() != null ? user.getAiTone() : "Professional";
        String hashtags = user != null && user.getCustomHashtags() != null ? user.getCustomHashtags() : "";

        return String.format(
                "Write a highly engaging %s post about my latest code push to a repository named '%s'. " +
                "The tone of the post MUST be '%s'. " +
                "Here is the commit message indicating what I did:\n'%s'\n\n" +
                "Keep it concise, use relevant emojis, and format it nicely for %s. " +
                "Also include these custom hashtags at the end if provided: %s. " +
                "Do NOT include any introduction or explanation, just the post itself.",
                platform, repoName, tone, commitMessage, platform, hashtags
        );
    }

    private String generateMockPost(String commitMessage, String repoName, String platform, com.autodev.entity.User user) {
        String tone = user != null && user.getAiTone() != null ? user.getAiTone() : "Professional";
        String hashtags = user != null && user.getCustomHashtags() != null ? user.getCustomHashtags() : "";
        
        return String.format(
                "🚀 Just pushed a major update to %s!\n\n" +
                "Today I implemented: %s. This significantly improves the architecture and handles edge cases securely.\n\n" +
                "[%s Tone] The journey of building this module has taught me a lot about robust backend design. " +
                "Check out the repository to see the code!\n\n" +
                "#Developer #Java #%s #Coding %s",
                repoName, commitMessage, tone, platform.replaceAll("\\s+", ""), hashtags
        );
    }
}
