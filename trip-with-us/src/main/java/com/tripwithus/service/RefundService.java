package com.tripwithus.service;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Refund;
import com.tripwithus.repository.RefundRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Cancellation & Refund system.
 * Policy:
 *  - Cancelled within 24 hours of the reservation being MADE -> 50% refund.
 *  - Cancelled more than 24h after booking but > 48h before travel -> 90% refund.
 *  - Cancelled within 48h of travel date -> 25% refund (partial).
 *  - Otherwise -> 75% refund.
 */
@Service
public class RefundService {

    private final RefundRepository refundRepository;

    public RefundService(RefundRepository refundRepository) {
        this.refundRepository = refundRepository;
    }

    public Refund initiateRefund(Booking booking, String reason) {
        double refundPercent = calculateRefundPercent(booking);
        double finalAmount = booking.getFinalAmount() != null ? booking.getFinalAmount() : 0.0;
        double refundAmount = Math.round(finalAmount * refundPercent / 100.0 * 100.0) / 100.0;

        Refund refund = new Refund();
        refund.setBooking(booking);
        refund.setRefundAmount(refundAmount);
        refund.setReason(reason);
        refund.setStatus(Refund.RefundStatus.PENDING);
        refund.setExpectedCompletionAt(LocalDateTime.now().plusDays(5));
        return refundRepository.save(refund);
    }

    private double calculateRefundPercent(Booking booking) {
        long hoursSinceBooking = Duration.between(booking.getBookedAt(), LocalDateTime.now()).toHours();
        if (hoursSinceBooking <= 24) {
            return 50.0;
        }
        try {
            java.time.LocalDate travelDate = java.time.LocalDate.parse(booking.getTravelDate());
            long hoursToTravel = Duration.between(LocalDateTime.now(), travelDate.atStartOfDay()).toHours();
            if (hoursToTravel <= 48) {
                return 25.0;
            }
            return 90.0;
        } catch (Exception e) {
            return 75.0;
        }
    }

    public List<Refund> getUserRefunds(Long userId) {
        return refundRepository.findByBookingUserIdOrderByRequestedAtDesc(userId);
    }

    public Refund advanceStatus(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("Refund not found"));
        if (refund.getStatus() == Refund.RefundStatus.PENDING) {
            refund.setStatus(Refund.RefundStatus.PROCESSED);
        } else if (refund.getStatus() == Refund.RefundStatus.PROCESSED) {
            refund.setStatus(Refund.RefundStatus.COMPLETED);
            refund.setProcessedAt(LocalDateTime.now());
        }
        return refundRepository.save(refund);
    }

    public List<Refund> all() { return refundRepository.findAll(); }
}
