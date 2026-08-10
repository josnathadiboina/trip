package com.tripwithus.repository;

import com.tripwithus.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarRepository extends JpaRepository<Car, Long> {
    List<Car> findByFromCityIgnoreCaseAndToCityIgnoreCaseAndTravelDate(String fromCity, String toCity, String travelDate);
}
