package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Hotel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String hotelName;
    private String location;
    private String roomType; // Standard, Deluxe, Suite
    private Integer totalRooms = 20;
    private Integer availableRooms = 20;
    private Double basePrice;
    private Double currentPrice;
    private Double rating = 4.3;
    private String imageUrl;
    private String amenities; // comma separated
}
