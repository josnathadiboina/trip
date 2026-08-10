package com.tripwithus.controller;

import com.tripwithus.model.Booking;
import com.tripwithus.model.PriceFreeze;
import com.tripwithus.model.PriceHistory;
import com.tripwithus.service.CurrentUserService;
import com.tripwithus.service.PricingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {
    private final PricingService pricingService;
    private final CurrentUserService currentUserService;

    public PricingController(PricingService pricingService, CurrentUserService currentUserService) {
        this.pricingService = pricingService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/history")
    public List<PriceHistory> history(@RequestParam Booking.BookingType type, @RequestParam Long targetId) {
        return pricingService.getPriceHistory(type, targetId);
    }

    @PostMapping("/freeze")
    public PriceFreeze freeze(@RequestBody Map<String, Object> body) {
        Booking.BookingType type = Booking.BookingType.valueOf((String) body.get("type"));
        Long targetId = Long.valueOf(body.get("targetId").toString());
        Double price = Double.valueOf(body.get("price").toString());
        int minutes = body.containsKey("minutes") ? Integer.parseInt(body.get("minutes").toString()) : 30;
        return pricingService.freezePrice(currentUserService.getCurrentUser(), type, targetId, price, minutes);
    }

    @GetMapping("/freeze/active")
    public Double activeFreeze(@RequestParam Booking.BookingType type, @RequestParam Long targetId) {
        return pricingService.getActiveFrozenPrice(currentUserService.getCurrentUser().getId(), type, targetId);
    }
}
