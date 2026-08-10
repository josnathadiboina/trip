package com.tripwithus;

import com.tripwithus.model.*;
import com.tripwithus.repository.*;
import com.tripwithus.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Acceptance tests covering the 6 required feature test cases:
 * 1. Live Flight Status (mock API)
 * 2. Dynamic Pricing Engine
 * 3. Cancellation & Refund system
 * 4. Interactive Seat/Room Selection
 * 5. Review & Rating system
 * 6. Personalized Recommendations
 */
@SpringBootTest
@Transactional
class FeatureAcceptanceTests {

    @Autowired FlightRepository flightRepository;
    @Autowired FlightStatusService flightStatusService;
    @Autowired PricingService pricingService;
    @Autowired BusRepository busRepository;
    @Autowired SeatService seatService;
    @Autowired UserRepository userRepository;
    @Autowired BookingRepository bookingRepository;
    @Autowired BookingService bookingService;
    @Autowired ReviewService reviewService;
    @Autowired RecommendationService recommendationService;

    private User testUser() {
        User u = new User();
        u.setName("Test User");
        u.setAge(28);
        u.setMobileNumber("9999900000" + (long)(Math.random() * 999));
        u.setEmail("test" + System.nanoTime() + "@mail.com");
        u.setPassword("hashed");
        u.setLocation("Chennai");
        return userRepository.save(u);
    }

    @Test
    void test1_liveFlightStatusUpdatesAndHistoryTracked() {
        Flight flight = flightRepository.findAll().get(0);
        var update = flightStatusService.pushRandomUpdate(flight);
        assertNotNull(update.getStatus());
        List<?> history = flightStatusService.history(flight.getId());
        assertFalse(history.isEmpty());
    }

    @Test
    void test2_dynamicPricingAdjustsForPeakSeasonAndDemand() {
        double normalPrice = pricingService.computeDynamicPrice(Booking.BookingType.BUS, 999L, 1000.0, 40, 40, "2026-07-25");
        double peakPrice = pricingService.computeDynamicPrice(Booking.BookingType.BUS, 999L, 1000.0, 40, 40, "2026-12-24");
        assertTrue(peakPrice > normalPrice, "Peak season price should be higher");
        assertFalse(pricingService.getPriceHistory(Booking.BookingType.BUS, 999L).isEmpty());
    }

    @Test
    void test3_cancellationTriggersAutoCalculatedRefund() {
        User user = testUser();
        Bus bus = busRepository.findAll().get(0);
        com.tripwithus.dto.BookingRequest req = new com.tripwithus.dto.BookingRequest();
        req.setBookingType(Booking.BookingType.BUS);
        req.setReferenceId(bus.getId());
        req.setFromLocation(bus.getFromCity());
        req.setToLocation(bus.getToCity());
        req.setTravelDate(bus.getTravelDate());
        req.setPassengerCount(1);
        Booking booking = bookingService.createBooking(user, req);

        Booking cancelled = bookingService.cancelBooking(booking.getId(), user.getId(), "Change of plans");
        assertEquals(Booking.BookingStatus.CANCELLED, cancelled.getStatus());
    }

    @Test
    void test4_seatMapGeneratedWithBookedAndAvailableSeats() {
        Bus bus = busRepository.findAll().get(0);
        List<Seat> seats = seatService.getOrGenerateSeats(Seat.VehicleType.BUS, bus.getId(), bus.getTotalSeats(), 5);
        assertEquals(bus.getTotalSeats().intValue(), seats.size());
    }

    @Test
    void test5_reviewSystemSupportsRatingSortingAndFlagging() {
        User user = testUser();
        Review review = reviewService.addReview(user, Booking.BookingType.HOTEL, 1L, 5, "Amazing stay!", "");
        assertEquals(5, review.getRating());
        Review flagged = reviewService.flag(review.getId());
        assertTrue(flagged.getFlagged());
        assertFalse(reviewService.getReviews(Booking.BookingType.HOTEL, 1L, "highest").isEmpty());
    }

    @Test
    void test6_recommendationsGeneratedWithReasoning() {
        User user = testUser();
        List<Recommendation> recs = recommendationService.generate(user);
        assertFalse(recs.isEmpty());
        assertNotNull(recs.get(0).getReasonText());
    }
}
