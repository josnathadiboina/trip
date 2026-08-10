package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Train {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String trainName;
    private String trainNumber;
    private String fromCity;
    private String toCity;
    private String departureTime;
    private String arrivalTime;
    private String travelDate;
    private String travelClass; // Sleeper, AC 3-Tier, AC 2-Tier, AC First
    private Integer totalSeats = 72;
    private Integer availableSeats = 72;
    private Double basePrice = 0.0;
    private Double currentPrice = 0.0;
}
