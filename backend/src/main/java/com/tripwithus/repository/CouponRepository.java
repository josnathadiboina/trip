package com.tripwithus.repository;

import com.tripwithus.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    java.util.Optional<Coupon> findByCodeAndActiveTrue(String code);
    List<Coupon> findByActiveTrue();
}
