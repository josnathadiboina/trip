package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Issue {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String subject;
    private String description;

    @Enumerated(EnumType.STRING)
    private IssueStatus status = IssueStatus.OPEN;

    private String adminResponse;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;

    public enum IssueStatus { OPEN, IN_PROGRESS, RESOLVED }
}
