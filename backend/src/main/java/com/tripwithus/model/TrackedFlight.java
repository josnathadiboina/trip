package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class TrackedFlight {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Long flightId;
}
