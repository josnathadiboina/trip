package com.tripwithus.service;

import com.tripwithus.model.Flight;
import com.tripwithus.model.FlightStatusUpdate;
import com.tripwithus.model.TrackedFlight;
import com.tripwithus.model.User;
import com.tripwithus.repository.FlightRepository;
import com.tripwithus.repository.FlightStatusUpdateRepository;
import com.tripwithus.repository.TrackedFlightRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

/**
 * Mock "Live Flight Status" API.
 * A scheduled job randomly nudges flight statuses to simulate a real-time feed.
 * In a production system this would call a real aviation-data provider instead.
 */
@Service
public class FlightStatusService {

    private final FlightRepository flightRepository;
    private final FlightStatusUpdateRepository statusUpdateRepository;
    private final TrackedFlightRepository trackedFlightRepository;

    private static final String[] STATUSES = {"On Time", "Delayed by 1h", "Boarding", "Delayed by 30m", "Departed"};
    private static final String[] DELAY_REASONS = {"Air traffic congestion", "Weather conditions", "Technical inspection", "Late arrival of aircraft"};
    private final Random random = new Random();

    public FlightStatusService(FlightRepository flightRepository, FlightStatusUpdateRepository statusUpdateRepository,
                                TrackedFlightRepository trackedFlightRepository) {
        this.flightRepository = flightRepository;
        this.statusUpdateRepository = statusUpdateRepository;
        this.trackedFlightRepository = trackedFlightRepository;
    }

    /** Runs every 45 seconds, simulating a live feed for a handful of flights. */
    @Scheduled(fixedRate = 45000)
    public void simulateLiveUpdates() {
        List<Flight> flights = flightRepository.findAll();
        if (flights.isEmpty()) return;

        // Nudge a random subset of flights each cycle
        flights.stream().filter(f -> random.nextDouble() < 0.3).forEach(this::pushRandomUpdate);
    }

    public FlightStatusUpdate pushRandomUpdate(Flight flight) {
        String status = STATUSES[random.nextInt(STATUSES.length)];
        String reason = status.startsWith("Delayed") ? DELAY_REASONS[random.nextInt(DELAY_REASONS.length)] : null;

        flight.setLiveStatus(status);
        flight.setDelayReason(reason);
        if (status.startsWith("Delayed")) {
            flight.setRevisedDepartureTime(shiftTime(flight.getDepartureTime(), status.contains("1h") ? 60 : 30));
            flight.setEstimatedArrival(shiftTime(flight.getArrivalTime(), status.contains("1h") ? 60 : 30));
        } else {
            flight.setRevisedDepartureTime(flight.getDepartureTime());
            flight.setEstimatedArrival(flight.getArrivalTime());
        }
        flightRepository.save(flight);

        FlightStatusUpdate update = new FlightStatusUpdate();
        update.setFlightId(flight.getId());
        update.setStatus(status);
        update.setReason(reason);
        update.setRevisedDepartureTime(flight.getRevisedDepartureTime());
        update.setEstimatedArrival(flight.getEstimatedArrival());
        return statusUpdateRepository.save(update);
    }

    private String shiftTime(String hhmm, int minutes) {
        try {
            String[] parts = hhmm.split(":");
            int h = Integer.parseInt(parts[0]);
            int m = Integer.parseInt(parts[1]);
            int total = (h * 60 + m + minutes) % (24 * 60);
            return String.format("%02d:%02d", total / 60, total % 60);
        } catch (Exception e) {
            return hhmm;
        }
    }

    public List<FlightStatusUpdate> history(Long flightId) {
        return statusUpdateRepository.findByFlightIdOrderByUpdatedAtDesc(flightId);
    }

    public TrackedFlight track(User user, Long flightId) {
        if (trackedFlightRepository.existsByUserIdAndFlightId(user.getId(), flightId)) {
            return trackedFlightRepository.findByUserId(user.getId()).stream()
                    .filter(t -> t.getFlightId().equals(flightId)).findFirst().orElseThrow();
        }
        TrackedFlight tracked = new TrackedFlight();
        tracked.setUser(user);
        tracked.setFlightId(flightId);
        return trackedFlightRepository.save(tracked);
    }

    public List<TrackedFlight> getTrackedFlights(Long userId) {
        return trackedFlightRepository.findByUserId(userId);
    }
}
