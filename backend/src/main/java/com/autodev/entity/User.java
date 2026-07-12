package com.autodev.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String githubId;

    private String username;
    private String email;
    private String avatarUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    private String aiTone = "Professional";
    private String targetPlatforms = "LinkedIn, Twitter";
    private String customHashtags = "";

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGithubId() {
        return githubId;
    }

    public void setGithubId(String githubId) {
        this.githubId = githubId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getAiTone() {
        return aiTone;
    }

    public void setAiTone(String aiTone) {
        this.aiTone = aiTone;
    }

    public String getTargetPlatforms() {
        return targetPlatforms;
    }

    public void setTargetPlatforms(String targetPlatforms) {
        this.targetPlatforms = targetPlatforms;
    }

    public String getCustomHashtags() {
        return customHashtags;
    }

    public void setCustomHashtags(String customHashtags) {
        this.customHashtags = customHashtags;
    }
}
