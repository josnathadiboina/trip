package com.tripwithus.controller;

import com.tripwithus.model.Recommendation;
import com.tripwithus.service.CurrentUserService;
import com.tripwithus.service.RecommendationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final RecommendationService recommendationService;
    private final CurrentUserService currentUserService;

    public RecommendationController(RecommendationService recommendationService, CurrentUserService currentUserService) {
        this.recommendationService = recommendationService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/generate")
    public List<Recommendation> generate() {
        return recommendationService.generate(currentUserService.getCurrentUser());
    }

    @GetMapping("/my")
    public List<Recommendation> my() {
        return recommendationService.getUserRecommendations(currentUserService.getCurrentUser().getId());
    }

    @PostMapping("/{id}/feedback")
    public Recommendation feedback(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return recommendationService.feedback(id, body.get("feedback"));
    }
}
