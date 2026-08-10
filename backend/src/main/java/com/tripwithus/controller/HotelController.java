package com.tripwithus.controller;

import com.tripwithus.model.Hotel;
import com.tripwithus.service.HotelService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class HotelController {
    private final HotelService hotelService;

    public HotelController(HotelService hotelService) { this.hotelService = hotelService; }

    @GetMapping("/search/hotels")
    public List<Hotel> search(@RequestParam String location, @RequestParam(required = false) String date) {
        return hotelService.search(location, date);
    }

    @GetMapping("/hotels/{id}")
    public Hotel get(@PathVariable Long id) { return hotelService.getById(id); }
}
