package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Flight {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String airline;
    private String flightNumber;
    private String fromCity;
    private String toCity;
    private String departureTime;
    private String arrivalTime;
    private String travelDate;
    private Integer totalSeats = 180;
    private Integer availableSeats = 180;
    private Double basePrice = 0.0;
    private Double currentPrice = 0.0;
    private Double rating = 4.2;

    // live status fields (mock live tracking)
    private String liveStatus = "On Time"; // On Time, Delayed by 1h, Boarding, Departed, Landed
    private String delayReason;
    private String revisedDepartureTime;
    private String estimatedArrival;
}
