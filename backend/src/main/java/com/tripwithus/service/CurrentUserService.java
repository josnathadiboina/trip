package com.tripwithus.service;

import com.tripwithus.model.User;
import com.tripwithus.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByMobileNumber(mobile)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    public String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
