package com.autodev.controller;

import com.autodev.dto.GithubPushEvent;
import com.autodev.service.WebhookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
public class GithubWebhookController {

    private final WebhookService webhookService;

    public GithubWebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/github")
    public ResponseEntity<String> handleGithubPush(@RequestBody GithubPushEvent event,
                                                   @RequestHeader(value = "X-GitHub-Event", required = false) String githubEvent) {
        // We only care about push events for generating posts right now
        if ("push".equalsIgnoreCase(githubEvent)) {
            try {
                webhookService.processGithubPush(event);
                return ResponseEntity.ok("Webhook processed successfully");
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Error processing webhook: " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok("Event ignored");
    }
}
