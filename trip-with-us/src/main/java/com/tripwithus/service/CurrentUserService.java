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
        String mobile = getCurrentUsername();
        return userRepository.findByMobileNumber(mobile)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    public String getCurrentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new SecurityException("Not authenticated");
        }
        return auth.getName();
    }
}
