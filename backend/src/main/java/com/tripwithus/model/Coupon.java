package com.tripwithus.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Coupon {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String code;
    private String description;
    private Double discountPercent;
    private String validFrom;
    private String validTo;
    private Boolean active = true;
}
