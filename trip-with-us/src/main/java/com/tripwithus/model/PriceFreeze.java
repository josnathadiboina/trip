package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class PriceFreeze {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Booking.BookingType targetType;

    private Long targetId;
    private Double frozenPrice;
    private LocalDateTime frozenAt = LocalDateTime.now();
    private LocalDateTime expiresAt;
    private Boolean active = true;
}
