package com.tripwithus.repository;

import com.tripwithus.model.PriceFreeze;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceFreezeRepository extends JpaRepository<PriceFreeze, Long> {
    List<PriceFreeze> findByUserIdAndActiveTrue(Long userId);
}
