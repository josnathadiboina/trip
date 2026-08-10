package com.tripwithus.controller;

import com.tripwithus.model.Refund;
import com.tripwithus.service.CurrentUserService;
import com.tripwithus.service.RefundService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {
    private final RefundService refundService;
    private final CurrentUserService currentUserService;

    public RefundController(RefundService refundService, CurrentUserService currentUserService) {
        this.refundService = refundService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/my")
    public List<Refund> myRefunds() {
        return refundService.getUserRefunds(currentUserService.getCurrentUser().getId());
    }
}
