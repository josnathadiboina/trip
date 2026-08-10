package com.tripwithus.repository;

import com.tripwithus.model.FlightStatusUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlightStatusUpdateRepository extends JpaRepository<FlightStatusUpdate, Long> {
    List<FlightStatusUpdate> findByFlightIdOrderByUpdatedAtDesc(Long flightId);
}
