package com.tripwithus.service;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Review;
import com.tripwithus.model.ReviewReply;
import com.tripwithus.model.User;
import com.tripwithus.repository.ReviewReplyRepository;
import com.tripwithus.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository replyRepository;

    public ReviewService(ReviewRepository reviewRepository, ReviewReplyRepository replyRepository) {
        this.reviewRepository = reviewRepository;
        this.replyRepository = replyRepository;
    }

    public Review addReview(User user, Booking.BookingType targetType, Long targetId, int rating, String comment, String photoUrls) {
        Review review = new Review();
        review.setUser(user);
        review.setTargetType(targetType);
        review.setTargetId(targetId);
        review.setRating(rating);
        review.setComment(comment);
        review.setPhotoUrls(photoUrls);
        return reviewRepository.save(review);
    }

    public List<Review> getReviews(Booking.BookingType targetType, Long targetId, String sort) {
        List<Review> reviews = reviewRepository.findByTargetTypeAndTargetIdAndRemovedByModeratorFalse(targetType, targetId);
        return switch (sort == null ? "" : sort) {
            case "highest" -> reviews.stream().sorted(Comparator.comparing(Review::getRating).reversed()).toList();
            case "helpful" -> reviews.stream().sorted(Comparator.comparing(Review::getHelpfulCount).reversed()).toList();
            default -> reviews.stream().sorted(Comparator.comparing(Review::getCreatedAt).reversed()).toList(); // newest
        };
    }

    public ReviewReply reply(User user, Long reviewId, String comment) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new IllegalArgumentException("Review not found"));
        ReviewReply reply = new ReviewReply();
        reply.setReview(review);
        reply.setUser(user);
        reply.setComment(comment);
        return replyRepository.save(reply);
    }

    public List<ReviewReply> getReplies(Long reviewId) {
        return replyRepository.findByReviewId(reviewId);
    }

    public Review flag(Long reviewId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new IllegalArgumentException("Review not found"));
        review.setFlagged(true);
        return reviewRepository.save(review);
    }

    public Review markHelpful(Long reviewId) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new IllegalArgumentException("Review not found"));
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        return reviewRepository.save(review);
    }

    // --- Moderation (admin) ---
    public List<Review> flaggedReviews() { return reviewRepository.findByFlaggedTrue(); }

    public Review moderate(Long reviewId, boolean remove) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new IllegalArgumentException("Review not found"));
        review.setRemovedByModerator(remove);
        review.setFlagged(false);
        return reviewRepository.save(review);
    }
}
