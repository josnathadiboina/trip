package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Refund {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    private Double refundAmount;
    private String reason;

    @Enumerated(EnumType.STRING)
    private RefundStatus status = RefundStatus.PENDING;

    private LocalDateTime requestedAt = LocalDateTime.now();
    private LocalDateTime expectedCompletionAt;
    private LocalDateTime processedAt;

    public enum RefundStatus { PENDING, PROCESSED, COMPLETED }
}
