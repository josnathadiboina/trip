package com.tripwithus.repository;

import com.tripwithus.model.Train;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainRepository extends JpaRepository<Train, Long> {
    List<Train> findByFromCityIgnoreCaseAndToCityIgnoreCaseAndTravelDate(String fromCity, String toCity, String travelDate);
}
