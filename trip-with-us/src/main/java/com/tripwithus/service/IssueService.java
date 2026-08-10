package com.tripwithus.service;

import com.tripwithus.model.Issue;
import com.tripwithus.model.User;
import com.tripwithus.repository.IssueRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IssueService {
    private final IssueRepository issueRepository;

    public IssueService(IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
    }

    public Issue raise(User user, String subject, String description) {
        Issue issue = new Issue();
        issue.setUser(user);
        issue.setSubject(subject);
        issue.setDescription(description);
        return issueRepository.save(issue);
    }

    public List<Issue> getUserIssues(Long userId) { return issueRepository.findByUserId(userId); }

    public List<Issue> all() { return issueRepository.findAll(); }

    public Issue resolve(Long issueId, String adminResponse, Issue.IssueStatus status) {
        Issue issue = issueRepository.findById(issueId).orElseThrow(() -> new IllegalArgumentException("Issue not found"));
        issue.setAdminResponse(adminResponse);
        issue.setStatus(status);
        if (status == Issue.IssueStatus.RESOLVED) issue.setResolvedAt(LocalDateTime.now());
        return issueRepository.save(issue);
    }
}
