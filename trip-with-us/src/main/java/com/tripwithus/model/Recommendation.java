package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Recommendation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Booking.BookingType type; // HOTEL, FLIGHT, etc (destination suggestion)

    private String itemName; // e.g. "Bali Beach Resort"
    private String reasonText; // "You liked beaches! Try Bali."
    private Double matchScore = 0.0;
    private String feedback; // HELPFUL, IRRELEVANT, null
}
