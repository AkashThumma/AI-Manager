package com.autodev.security;

import com.autodev.entity.User;
import com.autodev.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public OAuth2LoginSuccessHandler(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("avatar_url");
        Object idObj = oAuth2User.getAttribute("id");
        String githubId = idObj != null ? idObj.toString() : null;

        if (email == null) {
            email = oAuth2User.getAttribute("login") + "@github.com";
        }

        // Save or update user
        String finalEmail = email;
        Optional<User> existingUser = userRepository.findAll().stream()
                .filter(u -> finalEmail.equals(u.getEmail()))
                .findFirst();

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            user.setAvatarUrl(avatarUrl);
            user.setUsername(name != null ? name : oAuth2User.getAttribute("login"));
            userRepository.save(user);
        } else {
            user = new User();
            user.setEmail(email);
            user.setGithubId(githubId);
            user.setAvatarUrl(avatarUrl);
            user.setUsername(name != null ? name : oAuth2User.getAttribute("login"));
            userRepository.save(user);
        }

        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        // Redirect to Next.js frontend with the token
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/dashboard/approvals")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
