package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Bus {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String operatorName;
    private String busType; // AC Sleeper, Non-AC Seater, etc.
    private String fromCity;
    private String toCity;
    private String departureTime;
    private String arrivalTime;
    private String travelDate;
    private Integer totalSeats = 40;
    private Integer availableSeats = 40;
    private Double basePrice = 0.0;
    private Double currentPrice = 0.0;
    private Double rating = 4.2;
}
