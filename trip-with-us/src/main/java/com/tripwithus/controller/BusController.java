package com.tripwithus.controller;

import com.tripwithus.model.Bus;
import com.tripwithus.model.Seat;
import com.tripwithus.service.BusService;
import com.tripwithus.service.SeatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BusController {
    private final BusService busService;
    private final SeatService seatService;

    public BusController(BusService busService, SeatService seatService) {
        this.busService = busService;
        this.seatService = seatService;
    }

    @GetMapping("/search/buses")
    public List<Bus> search(@RequestParam String from, @RequestParam String to, @RequestParam String date) {
        return busService.search(from, to, date);
    }

    @GetMapping("/buses/{id}")
    public Bus get(@PathVariable Long id) { return busService.getById(id); }

    @GetMapping("/buses/{id}/seats")
    public List<Seat> seats(@PathVariable Long id) {
        Bus bus = busService.getById(id);
        int alreadyBooked = bus.getTotalSeats() - bus.getAvailableSeats();
        return seatService.getOrGenerateSeats(Seat.VehicleType.BUS, id, bus.getTotalSeats(), alreadyBooked);
    }
}
