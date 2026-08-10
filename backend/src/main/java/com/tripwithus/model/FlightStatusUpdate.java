package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class FlightStatusUpdate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long flightId;
    private String status; // On Time, Delayed by 1h, Boarding, Departed, Landed
    private String reason;
    private String revisedDepartureTime;
    private String estimatedArrival;
    private LocalDateTime updatedAt = LocalDateTime.now();
}
