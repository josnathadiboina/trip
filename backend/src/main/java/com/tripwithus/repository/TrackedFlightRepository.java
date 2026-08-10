package com.tripwithus.repository;

import com.tripwithus.model.TrackedFlight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackedFlightRepository extends JpaRepository<TrackedFlight, Long> {
    List<TrackedFlight> findByUserId(Long userId);
    boolean existsByUserIdAndFlightId(Long userId, Long flightId);
}
