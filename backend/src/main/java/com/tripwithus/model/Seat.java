package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Seat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType; // BUS, TRAIN, FLIGHT

    private Long vehicleId;
    private String seatNumber;
    private String seatClass; // e.g. Window, Aisle, Premium
    private Double priceDelta = 0.0; // extra price for premium seats
    private Boolean booked = false;

    public enum VehicleType { BUS, TRAIN, FLIGHT }
}
