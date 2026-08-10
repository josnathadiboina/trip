package com.tripwithus.controller;

import com.tripwithus.dto.ApiResponse;
import com.tripwithus.dto.BookingRequest;
import com.tripwithus.model.Booking;
import com.tripwithus.service.BookingService;
import com.tripwithus.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;
    private final CurrentUserService currentUserService;

    public BookingController(BookingService bookingService, CurrentUserService currentUserService) {
        this.bookingService = bookingService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody BookingRequest req) {
        try {
            Booking booking = bookingService.createBooking(currentUserService.getCurrentUser(), req);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/my")
    public List<Booking> myBookings() {
        return bookingService.getUserBookings(currentUserService.getCurrentUser().getId());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String reason = body.getOrDefault("reason", "Not specified");
            Booking booking = bookingService.cancelBooking(id, currentUserService.getCurrentUser().getId(), reason);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
