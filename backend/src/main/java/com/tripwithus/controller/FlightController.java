package com.tripwithus.controller;

import com.tripwithus.model.Flight;
import com.tripwithus.model.FlightStatusUpdate;
import com.tripwithus.model.Seat;
import com.tripwithus.model.TrackedFlight;
import com.tripwithus.service.CurrentUserService;
import com.tripwithus.service.FlightService;
import com.tripwithus.service.FlightStatusService;
import com.tripwithus.service.SeatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FlightController {
    private final FlightService flightService;
    private final SeatService seatService;
    private final FlightStatusService flightStatusService;
    private final CurrentUserService currentUserService;

    public FlightController(FlightService flightService, SeatService seatService,
                             FlightStatusService flightStatusService, CurrentUserService currentUserService) {
        this.flightService = flightService;
        this.seatService = seatService;
        this.flightStatusService = flightStatusService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/search/flights")
    public List<Flight> search(@RequestParam String from, @RequestParam String to, @RequestParam String date) {
        return flightService.search(from, to, date);
    }

    @GetMapping("/flights/{id}")
    public Flight get(@PathVariable Long id) { return flightService.getById(id); }

    @GetMapping("/flights/{id}/seats")
    public List<Seat> seats(@PathVariable Long id) {
        Flight flight = flightService.getById(id);
        int alreadyBooked = flight.getTotalSeats() - flight.getAvailableSeats();
        return seatService.getOrGenerateSeats(Seat.VehicleType.FLIGHT, id, flight.getTotalSeats(), alreadyBooked);
    }

    // --- Live Flight Status (mock real-time feature / test case #1) ---
    @GetMapping("/flights/live/{id}")
    public Flight liveStatus(@PathVariable Long id) { return flightService.getById(id); }

    @PostMapping("/flights/live/{id}/refresh")
    public FlightStatusUpdate refresh(@PathVariable Long id) {
        return flightStatusService.pushRandomUpdate(flightService.getById(id));
    }

    @GetMapping("/flights/{id}/status-history")
    public List<FlightStatusUpdate> statusHistory(@PathVariable Long id) {
        return flightStatusService.history(id);
    }

    @PostMapping("/flights/{id}/track")
    public TrackedFlight track(@PathVariable Long id) {
        return flightStatusService.track(currentUserService.getCurrentUser(), id);
    }

    @GetMapping("/flights/tracked")
    public List<TrackedFlight> tracked() {
        return flightStatusService.getTrackedFlights(currentUserService.getCurrentUser().getId());
    }
}
