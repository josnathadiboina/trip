package com.tripwithus.repository;

import com.tripwithus.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByVehicleTypeAndVehicleId(Seat.VehicleType vehicleType, Long vehicleId);
}
