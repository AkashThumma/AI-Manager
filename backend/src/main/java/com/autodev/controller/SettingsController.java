package com.autodev.controller;

import com.autodev.entity.User;
import com.autodev.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final UserRepository userRepository;

    public SettingsController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getSettings() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> userEmail.equals(u.getEmail()))
                .findFirst();

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        Map<String, String> settings = new HashMap<>();
        settings.put("aiTone", user.getAiTone());
        settings.put("targetPlatforms", user.getTargetPlatforms());
        settings.put("customHashtags", user.getCustomHashtags());

        return ResponseEntity.ok(settings);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, String> newSettings) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> userEmail.equals(u.getEmail()))
                .findFirst();

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (newSettings.containsKey("aiTone")) {
            user.setAiTone(newSettings.get("aiTone"));
        }
        if (newSettings.containsKey("targetPlatforms")) {
            user.setTargetPlatforms(newSettings.get("targetPlatforms"));
        }
        if (newSettings.containsKey("customHashtags")) {
            user.setCustomHashtags(newSettings.get("customHashtags"));
        }

        userRepository.save(user);

        return ResponseEntity.ok(newSettings);
    }
}
