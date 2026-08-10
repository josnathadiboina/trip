package com.tripwithus.repository;

import com.tripwithus.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusRepository extends JpaRepository<Bus, Long> {
    List<Bus> findByFromCityIgnoreCaseAndToCityIgnoreCaseAndTravelDate(String fromCity, String toCity, String travelDate);
}
