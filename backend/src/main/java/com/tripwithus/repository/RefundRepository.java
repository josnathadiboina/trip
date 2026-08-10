package com.tripwithus.repository;

import com.tripwithus.model.Refund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByBookingUserIdOrderByRequestedAtDesc(Long userId);
    java.util.Optional<Refund> findByBookingId(Long bookingId);
}
