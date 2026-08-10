package com.tripwithus.repository;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTargetTypeAndTargetIdAndRemovedByModeratorFalse(Booking.BookingType targetType, Long targetId);
    List<Review> findByFlaggedTrue();
}
