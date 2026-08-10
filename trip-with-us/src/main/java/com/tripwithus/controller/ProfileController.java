package com.tripwithus.controller;

import com.tripwithus.dto.ApiResponse;
import com.tripwithus.model.Issue;
import com.tripwithus.model.User;
import com.tripwithus.repository.UserRepository;
import com.tripwithus.service.CurrentUserService;
import com.tripwithus.service.IssueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final IssueService issueService;

    public ProfileController(CurrentUserService currentUserService, UserRepository userRepository, IssueService issueService) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.issueService = issueService;
    }

    @GetMapping
    public User profile() { return currentUserService.getCurrentUser(); }

    @PutMapping
    public ResponseEntity<?> update(@RequestBody Map<String, Object> body) {
        User user = currentUserService.getCurrentUser();
        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("age") && body.get("age") != null) user.setAge(Integer.parseInt(body.get("age").toString()));
        if (body.containsKey("email")) user.setEmail((String) body.get("email"));
        if (body.containsKey("location")) user.setLocation((String) body.get("location"));
        userRepository.save(user);
        return ResponseEntity.ok(new ApiResponse(true, "Profile updated", user));
    }

    @PostMapping("/issues")
    public Issue raiseIssue(@RequestBody Map<String, String> body) {
        return issueService.raise(currentUserService.getCurrentUser(), body.get("subject"), body.get("description"));
    }

    @GetMapping("/issues")
    public List<Issue> myIssues() {
        return issueService.getUserIssues(currentUserService.getCurrentUser().getId());
    }
}
