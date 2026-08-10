package com.tripwithus.repository;

import com.tripwithus.model.Booking;
import com.tripwithus.model.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByTargetTypeAndTargetIdOrderByRecordedAtAsc(Booking.BookingType targetType, Long targetId);
}
