package com.tripwithus.controller;

import com.tripwithus.model.Seat;
import com.tripwithus.model.Train;
import com.tripwithus.service.SeatService;
import com.tripwithus.service.TrainService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TrainController {
    private final TrainService trainService;
    private final SeatService seatService;

    public TrainController(TrainService trainService, SeatService seatService) {
        this.trainService = trainService;
        this.seatService = seatService;
    }

    @GetMapping("/search/trains")
    public List<Train> search(@RequestParam String from, @RequestParam String to, @RequestParam String date) {
        return trainService.search(from, to, date);
    }

    @GetMapping("/trains/{id}")
    public Train get(@PathVariable Long id) { return trainService.getById(id); }

    @GetMapping("/trains/{id}/seats")
    public List<Seat> seats(@PathVariable Long id) {
        Train train = trainService.getById(id);
        int alreadyBooked = train.getTotalSeats() - train.getAvailableSeats();
        return seatService.getOrGenerateSeats(Seat.VehicleType.TRAIN, id, train.getTotalSeats(), alreadyBooked);
    }
}
