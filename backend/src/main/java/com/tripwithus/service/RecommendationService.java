package com.tripwithus.service;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Recommendation;
import com.tripwithus.model.User;
import com.tripwithus.repository.BookingRepository;
import com.tripwithus.repository.RecommendationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Simple content/collaborative-style recommendation engine.
 * Looks at a user's past booking destinations to infer a preference category,
 * then suggests items with a human-readable "why" explanation.
 */
@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final BookingRepository bookingRepository;

    private static final Map<String, List<String>> DESTINATION_POOL = Map.of(
            "beach", List.of("Goa Beach Resort", "Bali Getaway", "Andaman Islands Retreat"),
            "hill", List.of("Manali Hill Station", "Munnar Tea Gardens Stay", "Ooty Nilgiri Escape"),
            "heritage", List.of("Jaipur Heritage Hotel", "Hampi Ruins Tour", "Varanasi Ghat Experience"),
            "city", List.of("Mumbai City Break", "Bengaluru Weekend Stay", "Delhi Explorer Package")
    );

    public RecommendationService(RecommendationRepository recommendationRepository, BookingRepository bookingRepository) {
        this.recommendationRepository = recommendationRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Recommendation> generate(User user) {
        List<Booking> history = bookingRepository.findByUserIdOrderByBookedAtDesc(user.getId());
        String category = inferCategory(history);
        List<String> pool = DESTINATION_POOL.getOrDefault(category, DESTINATION_POOL.get("city"));

        pool.forEach(item -> {
            Recommendation rec = new Recommendation();
            rec.setUser(user);
            rec.setType(Booking.BookingType.HOTEL);
            rec.setItemName(item);
            rec.setReasonText("You booked " + category + " destinations before! Try " + item + ".");
            rec.setMatchScore(0.7 + Math.random() * 0.3);
            recommendationRepository.save(rec);
        });
        return recommendationRepository.findByUserId(user.getId());
    }

    private String inferCategory(List<Booking> history) {
        if (history.isEmpty()) return "city";
        String lastDestination = history.get(0).getToLocation() == null ? "" : history.get(0).getToLocation().toLowerCase();
        if (lastDestination.contains("goa") || lastDestination.contains("beach")) return "beach";
        if (lastDestination.contains("manali") || lastDestination.contains("ooty") || lastDestination.contains("shimla")) return "hill";
        if (lastDestination.contains("jaipur") || lastDestination.contains("hampi") || lastDestination.contains("varanasi")) return "heritage";
        return "city";
    }

    public Recommendation feedback(Long recId, String feedback) {
        Recommendation rec = recommendationRepository.findById(recId)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found"));
        rec.setFeedback(feedback);
        return recommendationRepository.save(rec);
    }

    public List<Recommendation> getUserRecommendations(Long userId) {
        return recommendationRepository.findByUserId(userId);
    }
}
