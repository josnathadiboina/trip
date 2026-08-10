package com.tripwithus.service;

import com.tripwithus.dto.AuthResponse;
import com.tripwithus.dto.LoginRequest;
import com.tripwithus.dto.SignupRequest;
import com.tripwithus.model.User;
import com.tripwithus.repository.UserRepository;
import com.tripwithus.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse signup(SignupRequest req) {
        if (userRepository.existsByMobileNumber(req.getMobileNumber())) {
            throw new IllegalArgumentException("Mobile number already registered");
        }
        User user = new User();
        user.setName(req.getName());
        user.setAge(req.getAge());
        user.setMobileNumber(req.getMobileNumber());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setLocation(req.getLocation());
        user.setRole(User.Role.USER);
        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getMobileNumber(), "USER");
        return new AuthResponse(token, "USER", saved.getName(), saved.getId(),
                saved.getEmail(), saved.getAge(), saved.getLocation(), saved.getMobileNumber());
    }

    public AuthResponse login(LoginRequest req) {
        // --- Hardcoded Admin login ---
        if (adminUsername.equals(req.getUsername()) && adminPassword.equals(req.getPassword())) {
            String token = jwtUtil.generateToken(adminUsername, "ADMIN");
            return new AuthResponse(token, "ADMIN", "Administrator", 0L,
                    null, null, null, adminUsername);
        }

        User user = userRepository.findByMobileNumber(req.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        String token = jwtUtil.generateToken(user.getMobileNumber(), "USER");
        return new AuthResponse(token, "USER", user.getName(), user.getId(),
                user.getEmail(), user.getAge(), user.getLocation(), user.getMobileNumber());
    }
}
