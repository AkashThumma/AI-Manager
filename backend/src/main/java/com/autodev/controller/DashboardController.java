package com.autodev.controller;

import com.autodev.entity.AIPost;
import com.autodev.entity.User;
import com.autodev.repository.AIPostRepository;
import com.autodev.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") // Allows local development testing
public class DashboardController {

    private final AIPostRepository aiPostRepository;
    private final UserRepository userRepository;

    public DashboardController(AIPostRepository aiPostRepository, UserRepository userRepository) {
        this.aiPostRepository = aiPostRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/posts/pending")
    public ResponseEntity<List<AIPost>> getPendingPosts() {
        String userEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> user = userRepository.findAll().stream()
                .filter(u -> userEmail.equals(u.getEmail()))
                .findFirst();

        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<AIPost> pendingPosts = aiPostRepository.findByUserId(user.get().getId()).stream()
                .filter(post -> "DRAFT".equals(post.getStatus()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(pendingPosts);
    }

    @PostMapping("/posts/{id}/approve")
    public ResponseEntity<String> approvePost(@PathVariable Long id) {
        String userEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<AIPost> post = aiPostRepository.findById(id);
        if (post.isEmpty() || !post.get().getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.notFound().build();
        }
        
        AIPost aiPost = post.get();
        aiPost.setStatus("APPROVED");
        aiPostRepository.save(aiPost);
        return ResponseEntity.ok("Post approved");
    }

    @PostMapping("/posts/{id}/reject")
    public ResponseEntity<String> rejectPost(@PathVariable Long id) {
        String userEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<AIPost> post = aiPostRepository.findById(id);
        if (post.isEmpty() || !post.get().getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.notFound().build();
        }
        
        AIPost aiPost = post.get();
        aiPost.setStatus("REJECTED");
        aiPostRepository.save(aiPost);
        return ResponseEntity.ok("Post rejected");
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Long>> getStats() {
        String userEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> user = userRepository.findAll().stream()
                .filter(u -> userEmail.equals(u.getEmail()))
                .findFirst();

        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Long userId = user.get().getId();

        long pending = aiPostRepository.findByUserId(userId).stream().filter(p -> "DRAFT".equals(p.getStatus())).count();
        long approved = aiPostRepository.findByUserId(userId).stream().filter(p -> "APPROVED".equals(p.getStatus())).count();
        long rejected = aiPostRepository.findByUserId(userId).stream().filter(p -> "REJECTED".equals(p.getStatus())).count();
        long total = pending + approved + rejected;

        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("pending", pending);
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        stats.put("total", total);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/posts/history")
    public ResponseEntity<List<AIPost>> getPostHistory() {
        String userEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> user = userRepository.findAll().stream()
                .filter(u -> userEmail.equals(u.getEmail()))
                .findFirst();

        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<AIPost> history = aiPostRepository.findByUserId(user.get().getId()).stream()
                .filter(post -> "APPROVED".equals(post.getStatus()) || "REJECTED".equals(post.getStatus()))
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }
}
