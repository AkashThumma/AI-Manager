package com.autodev.service;

import com.autodev.dto.CommitDto;
import com.autodev.dto.GithubPushEvent;
import com.autodev.entity.AIPost;
import com.autodev.entity.Commit;
import com.autodev.entity.Repository;
import com.autodev.entity.User;
import com.autodev.repository.AIPostRepository;
import com.autodev.repository.CommitRepository;
import com.autodev.repository.RepositoryRepository;
import com.autodev.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Service
public class WebhookService {

    private static final Logger logger = LoggerFactory.getLogger(WebhookService.class);

    private final UserRepository userRepository;
    private final RepositoryRepository repositoryRepository;
    private final CommitRepository commitRepository;
    private final AIPostRepository aiPostRepository;
    private final GeminiAIService geminiAIService;

    public WebhookService(UserRepository userRepository, RepositoryRepository repositoryRepository,
                          CommitRepository commitRepository, AIPostRepository aiPostRepository,
                          GeminiAIService geminiAIService) {
        this.userRepository = userRepository;
        this.repositoryRepository = repositoryRepository;
        this.commitRepository = commitRepository;
        this.aiPostRepository = aiPostRepository;
        this.geminiAIService = geminiAIService;
    }

    @Transactional
    public void processGithubPush(GithubPushEvent event) {
        if (event.getCommits() == null || event.getCommits().isEmpty()) {
            logger.info("No commits in push event. Ignoring.");
            return;
        }

        // 1. Resolve User (Matching by pusher email or pusher name/username)
        String pusherEmail = event.getPusher().getEmail();
        String pusherName = event.getPusher().getName();
        
        java.util.Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> (pusherEmail != null && pusherEmail.equals(u.getEmail())) || 
                             (pusherName != null && pusherName.equalsIgnoreCase(u.getUsername())) ||
                             (pusherName != null && u.getEmail() != null && u.getEmail().startsWith(pusherName)))
                .findFirst();

        if (userOpt.isEmpty()) {
            logger.warn("Received webhook but no matching registered user found for pusherName: {} email: {}", pusherName, pusherEmail);
            return;
        }
        
        User user = userOpt.get();

        // 2. Resolve Repository
        String repoFullName = event.getRepository().getFullName();
        Repository repository = repositoryRepository.findByFullName(repoFullName)
                .orElseGet(() -> {
                    Repository newRepo = new Repository();
                    newRepo.setUser(user);
                    newRepo.setName(event.getRepository().getName());
                    newRepo.setFullName(repoFullName);
                    newRepo.setHtmlUrl(event.getRepository().getHtmlUrl());
                    return repositoryRepository.save(newRepo);
                });
        repository.setLastSyncedAt(LocalDateTime.now());
        repositoryRepository.save(repository);

        // 3. Process Commits and Generate AI Posts
        for (CommitDto commitDto : event.getCommits()) {
            // Avoid duplicate commits
            if (commitRepository.findBySha(commitDto.getId()).isPresent()) {
                continue;
            }

            Commit commit = new Commit();
            commit.setRepository(repository);
            commit.setSha(commitDto.getId());
            commit.setMessage(commitDto.getMessage());
            commit.setUrl(commitDto.getUrl());
            commit.setCommittedAt(LocalDateTime.now()); // Fallback timestamp
            commitRepository.save(commit);

            logger.info("Saved new commit: {}", commit.getSha());

            String platforms = user.getTargetPlatforms() != null ? user.getTargetPlatforms().toLowerCase() : "linkedin, twitter";

            // Generate LinkedIn Post if requested
            if (platforms.contains("linkedin")) {
                String linkedInContent = geminiAIService.generatePostFromCommit(
                        commit.getMessage(), repository.getName(), "LinkedIn", user);
                saveAIPost(user, "LinkedIn", linkedInContent);
            }

            // Generate Twitter Post if requested
            if (platforms.contains("twitter")) {
                String twitterContent = geminiAIService.generatePostFromCommit(
                        commit.getMessage(), repository.getName(), "Twitter", user);
                saveAIPost(user, "Twitter", twitterContent);
            }
        }
    }

    private void saveAIPost(User user, String platform, String content) {
        AIPost post = new AIPost();
        post.setUser(user);
        post.setPlatform(platform);
        post.setContent(content);
        post.setStatus("DRAFT");
        aiPostRepository.save(post);
        logger.info("Generated new {} DRAFT post for user {}", platform, user.getUsername());
    }
}
