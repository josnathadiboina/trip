package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Car {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String carModel;
    private String carType; // Sedan, SUV, Hatchback
    private String fromCity;
    private String toCity;
    private String travelDate;
    private String pickupTime;
    private Integer seatCapacity = 4;
    private Boolean available = true;
    private Double basePrice = 0.0;
    private Double currentPrice = 0.0;
    private String driverName;
    private Double rating = 4.4;
}
