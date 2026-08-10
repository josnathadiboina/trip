package com.tripwithus.repository;

import com.tripwithus.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long> {
    List<Flight> findByFromCityIgnoreCaseAndToCityIgnoreCaseAndTravelDate(String fromCity, String toCity, String travelDate);
}
