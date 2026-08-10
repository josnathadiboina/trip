package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class PriceHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Booking.BookingType targetType;

    private Long targetId;
    private Double price;
    private String reason; // e.g. "Peak season +20%", "Demand surge"
    private LocalDateTime recordedAt = LocalDateTime.now();
}
