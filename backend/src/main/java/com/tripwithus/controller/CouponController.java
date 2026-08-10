package com.tripwithus.controller;

import com.tripwithus.dto.ApiResponse;
import com.tripwithus.model.Coupon;
import com.tripwithus.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {
    private final CouponService couponService;

    public CouponController(CouponService couponService) { this.couponService = couponService; }

    @GetMapping("/active")
    public List<Coupon> active() { return couponService.activeCoupons(); }

    @PostMapping("/validate/{code}")
    public ResponseEntity<?> validate(@PathVariable String code) {
        return couponService.validate(code)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid or expired coupon")));
    }
}
