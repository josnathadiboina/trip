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
        Object typeObj = body.get("type");
        Object targetIdObj = body.get("targetId");
        Object priceObj = body.get("price");
        Object minutesObj = body.get("minutes");
        if (typeObj == null || targetIdObj == null || priceObj == null) {
            throw new IllegalArgumentException("Missing required freeze fields (type, targetId, price)");
        }
        Booking.BookingType type = Booking.BookingType.valueOf(String.valueOf(typeObj));
        Long targetId = Long.valueOf(targetIdObj.toString());
        Double price = Double.valueOf(priceObj.toString());
        int minutes = minutesObj != null ? Integer.parseInt(minutesObj.toString()) : 30;
        return pricingService.freezePrice(currentUserService.getCurrentUser(), type, targetId, price, minutes);
    }

    @GetMapping("/freeze/active")
    public Double activeFreeze(@RequestParam Booking.BookingType type, @RequestParam Long targetId) {
        return pricingService.getActiveFrozenPrice(currentUserService.getCurrentUser().getId(), type, targetId);
    }
}
