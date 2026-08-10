package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Booking.BookingType targetType; // HOTEL or FLIGHT

    private Long targetId;
    private Integer rating; // 1-5
    private String comment;
    private String photoUrls; // comma separated
    private Integer helpfulCount = 0;
    private Boolean flagged = false;
    private Boolean removedByModerator = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}
