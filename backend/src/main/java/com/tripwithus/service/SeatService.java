package com.tripwithus.service;

import com.tripwithus.model.Seat;
import com.tripwithus.repository.SeatRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeatService {

    private final SeatRepository seatRepository;

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    /** Generates a seat map (once) for a given vehicle if it doesn't already exist. */
    public List<Seat> getOrGenerateSeats(Seat.VehicleType type, Long vehicleId, int totalSeats, int alreadyBooked) {
        List<Seat> existing = seatRepository.findByVehicleTypeAndVehicleId(type, vehicleId);
        if (!existing.isEmpty()) return existing;

List<Seat> seats = new ArrayList<>();
        int perRow = type == Seat.VehicleType.FLIGHT ? 6 : 4;
        int bookedSoFar = 0;
        for (int i = 0; i < totalSeats; i++) {
            Seat seat = new Seat();
            seat.setVehicleType(type);
            seat.setVehicleId(vehicleId);
            int rowNum = (i / perRow) + 1;
            char col = (char) ('A' + (i % perRow));
            seat.setSeatNumber(rowNum + String.valueOf(col));
            boolean premium = (i % perRow == 0 || i % perRow == perRow - 1);
            seat.setSeatClass(premium ? "Premium" : "Standard");
            seat.setPriceDelta(premium ? 250.0 : 0.0);
            // randomly mark a portion as already booked to simulate live occupancy
            boolean isBooked = bookedSoFar < alreadyBooked && Math.random() < 0.5;
            if (isBooked) bookedSoFar++;
            seat.setBooked(isBooked);
            seats.add(seat);
        }
        return seatRepository.saveAll(seats);
    }

    public List<Seat> bookSeats(Seat.VehicleType type, Long vehicleId, List<String> seatNumbers) {
        List<Seat> seats = seatRepository.findByVehicleTypeAndVehicleId(type, vehicleId);
        List<Seat> toBook = new ArrayList<>();
        for (Seat s : seats) {
            if (seatNumbers.contains(s.getSeatNumber())) {
                if (Boolean.TRUE.equals(s.getBooked())) {
                    throw new IllegalStateException("Seat " + s.getSeatNumber() + " is already booked");
                }
                s.setBooked(true);
                toBook.add(s);
            }
        }
        return seatRepository.saveAll(toBook);
    }
}
