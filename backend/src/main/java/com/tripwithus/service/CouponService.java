package com.tripwithus.service;

import com.tripwithus.model.Coupon;
import com.tripwithus.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CouponService {
    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<Coupon> activeCoupons() { return couponRepository.findByActiveTrue(); }

    public Optional<Coupon> validate(String code) {
        return couponRepository.findByCodeAndActiveTrue(code);
    }

    public Coupon create(Coupon coupon) { return couponRepository.save(coupon); }

    public Coupon toggle(Long id, boolean active) {
        Coupon c = couponRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        c.setActive(active);
        return couponRepository.save(c);
    }

    public List<Coupon> all() { return couponRepository.findAll(); }
}
