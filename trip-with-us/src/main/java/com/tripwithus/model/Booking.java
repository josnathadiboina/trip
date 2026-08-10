package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private BookingType bookingType; // BUS, CAR, TRAIN, FLIGHT, HOTEL

    private Long referenceId; // id of Bus/Car/Train/Flight/Hotel
    private String fromLocation;
    private String toLocation;
    private String travelDate;
    private String seatNumbers; // comma separated
    private Integer passengerCount = 1;
    private String passengerDetails; // JSON string of names/ages
    private String couponCode;
    private Double baseAmount;
    private Double discountAmount = 0.0;
    private Double finalAmount;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.CONFIRMED;

    private LocalDateTime bookedAt = LocalDateTime.now();
    private String cancellationReason;
    private LocalDateTime cancelledAt;

    public enum BookingType { BUS, CAR, TRAIN, FLIGHT, HOTEL }
    public enum BookingStatus { CONFIRMED, CANCELLED, COMPLETED }
}
