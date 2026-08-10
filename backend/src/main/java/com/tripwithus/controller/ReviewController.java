package com.tripwithus.controller;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Review;
import com.tripwithus.model.ReviewReply;
import com.tripwithus.service.CurrentUserService;
import com.tripwithus.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;
    private final CurrentUserService currentUserService;

    public ReviewController(ReviewService reviewService, CurrentUserService currentUserService) {
        this.reviewService = reviewService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public Review add(@RequestBody Map<String, Object> body) {
        Booking.BookingType type = Booking.BookingType.valueOf((String) body.get("targetType"));
        Long targetId = Long.valueOf(body.get("targetId").toString());
        int rating = Integer.parseInt(body.get("rating").toString());
        String comment = (String) body.getOrDefault("comment", "");
        String photos = (String) body.getOrDefault("photoUrls", "");
        return reviewService.addReview(currentUserService.getCurrentUser(), type, targetId, rating, comment, photos);
    }

    @GetMapping("/public/{type}/{targetId}")
    public List<Review> list(@PathVariable Booking.BookingType type, @PathVariable Long targetId,
                              @RequestParam(required = false) String sort) {
        return reviewService.getReviews(type, targetId, sort);
    }

    @PostMapping("/{id}/reply")
    public ReviewReply reply(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return reviewService.reply(currentUserService.getCurrentUser(), id, body.get("comment"));
    }

    @GetMapping("/{id}/replies")
    public List<ReviewReply> replies(@PathVariable Long id) { return reviewService.getReplies(id); }

    @PostMapping("/{id}/flag")
    public Review flag(@PathVariable Long id) { return reviewService.flag(id); }

    @PostMapping("/{id}/helpful")
    public Review helpful(@PathVariable Long id) { return reviewService.markHelpful(id); }
}
