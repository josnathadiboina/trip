package com.tripwithus.service;

import com.tripwithus.model.Booking;
import com.tripwithus.model.PriceFreeze;
import com.tripwithus.model.PriceHistory;
import com.tripwithus.model.User;
import com.tripwithus.repository.PriceFreezeRepository;
import com.tripwithus.repository.PriceHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Set;

/**
 * Dynamic Pricing Engine
 * - Adjusts price based on demand (seat scarcity), season/holidays, and day-of-week.
 * - Records every computed price into PriceHistory so users can view a price graph.
 * - Supports "price freeze": lock a price for a limited window.
 */
@Service
public class PricingService {

    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceFreezeRepository priceFreezeRepository;

    private static final Set<String> PEAK_MONTHS = Set.of("11", "12", "01"); // Nov, Dec, Jan - festival/holiday season

    public PricingService(PriceHistoryRepository priceHistoryRepository, PriceFreezeRepository priceFreezeRepository) {
        this.priceHistoryRepository = priceHistoryRepository;
        this.priceFreezeRepository = priceFreezeRepository;
    }

    public double computeDynamicPrice(Booking.BookingType type, Long targetId, double basePrice,
                                       int totalCapacity, int availableCapacity, String travelDate) {
        double price = basePrice;
        StringBuilder reason = new StringBuilder();

        // 1. Seasonal / holiday surcharge (+20%)
        if (isPeakSeason(travelDate)) {
            price *= 1.20;
            reason.append("Peak/holiday season (+20%). ");
        }

        // 2. Demand-based surge: the fewer seats left, the higher the price
        double occupancyRatio = totalCapacity == 0 ? 0 : 1.0 - ((double) availableCapacity / totalCapacity);
        if (occupancyRatio > 0.8) {
            price *= 1.15;
            reason.append("High demand, <20% seats left (+15%). ");
        } else if (occupancyRatio > 0.5) {
            price *= 1.08;
            reason.append("Moderate demand, filling fast (+8%). ");
        }

        // 3. Weekend surcharge
        try {
            if (travelDate != null) {
                LocalDate date = LocalDate.parse(travelDate);
                if (date.getDayOfWeek().getValue() >= 6) {
                    price *= 1.05;
                    reason.append("Weekend travel (+5%). ");
                }
            }
        } catch (DateTimeParseException ignored) { }

        price = Math.round(price * 100.0) / 100.0;

        PriceHistory history = new PriceHistory();
        history.setTargetType(type);
        history.setTargetId(targetId);
        history.setPrice(price);
        history.setReason(reason.length() == 0 ? "Standard pricing" : reason.toString().trim());
        priceHistoryRepository.save(history);

        return price;
    }

    public List<PriceHistory> getPriceHistory(Booking.BookingType type, Long targetId) {
        return priceHistoryRepository.findByTargetTypeAndTargetIdOrderByRecordedAtAsc(type, targetId);
    }

    public PriceFreeze freezePrice(User user, Booking.BookingType type, Long targetId, double currentPrice, int freezeMinutes) {
        PriceFreeze freeze = new PriceFreeze();
        freeze.setUser(user);
        freeze.setTargetType(type);
        freeze.setTargetId(targetId);
        freeze.setFrozenPrice(currentPrice);
        freeze.setExpiresAt(LocalDateTime.now().plusMinutes(freezeMinutes));
        freeze.setActive(true);
        return priceFreezeRepository.save(freeze);
    }

    public Double getActiveFrozenPrice(Long userId, Booking.BookingType type, Long targetId) {
        return priceFreezeRepository.findByUserIdAndActiveTrue(userId).stream()
                .filter(f -> f.getTargetType() == type && f.getTargetId().equals(targetId))
                .filter(f -> f.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(PriceFreeze::getFrozenPrice)
                .findFirst().orElse(null);
    }

    private boolean isPeakSeason(String travelDate) {
        if (travelDate == null || travelDate.length() < 7) return false;
        String month = travelDate.substring(5, 7);
        return PEAK_MONTHS.contains(month);
    }
}
