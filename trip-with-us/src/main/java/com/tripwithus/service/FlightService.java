package com.tripwithus.service;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Flight;
import com.tripwithus.repository.FlightRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FlightService {
    private final FlightRepository flightRepository;
    private final PricingService pricingService;

    public FlightService(FlightRepository flightRepository, PricingService pricingService) {
        this.flightRepository = flightRepository;
        this.pricingService = pricingService;
    }

    public List<Flight> search(String from, String to, String date) {
        List<Flight> flights = flightRepository.findByFromCityIgnoreCaseAndToCityIgnoreCaseAndTravelDate(from, to, date);
        flights.forEach(f -> f.setCurrentPrice(pricingService.computeDynamicPrice(
                Booking.BookingType.FLIGHT, f.getId(), f.getBasePrice(), f.getTotalSeats(), f.getAvailableSeats(), date)));
        return flights;
    }

    public Flight getById(Long id) {
        return flightRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Flight not found"));
    }

    public Flight decrementSeats(Long id, int count) {
        Flight flight = getById(id);
        flight.setAvailableSeats(Math.max(0, flight.getAvailableSeats() - count));
        return flightRepository.save(flight);
    }

    public Flight incrementSeats(Long id, int count) {
        Flight flight = getById(id);
        flight.setAvailableSeats(Math.min(flight.getTotalSeats(), flight.getAvailableSeats() + count));
        return flightRepository.save(flight);
    }

public List<Flight> all() { return flightRepository.findAll(); }
    public Flight save(Flight f) { return flightRepository.save(f); }
    public void delete(Long id) { flightRepository.deleteById(id); }
}
