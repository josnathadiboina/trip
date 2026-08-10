package com.tripwithus.service;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Bus;
import com.tripwithus.repository.BusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BusService {
    private final BusRepository busRepository;
    private final PricingService pricingService;

    public BusService(BusRepository busRepository, PricingService pricingService) {
        this.busRepository = busRepository;
        this.pricingService = pricingService;
    }

    public List<Bus> search(String from, String to, String date) {
        List<Bus> buses = busRepository.findByFromCityIgnoreCaseAndToCityIgnoreCaseAndTravelDate(from, to, date);
        buses.forEach(b -> b.setCurrentPrice(pricingService.computeDynamicPrice(
                Booking.BookingType.BUS, b.getId(), b.getBasePrice(), b.getTotalSeats(), b.getAvailableSeats(), date)));
        return buses;
    }

    public Bus getById(Long id) {
        return busRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Bus not found"));
    }

    public Bus decrementSeats(Long id, int count) {
        Bus bus = getById(id);
        bus.setAvailableSeats(Math.max(0, bus.getAvailableSeats() - count));
        return busRepository.save(bus);
    }

    public Bus incrementSeats(Long id, int count) {
        Bus bus = getById(id);
        bus.setAvailableSeats(Math.min(bus.getTotalSeats(), bus.getAvailableSeats() + count));
        return busRepository.save(bus);
    }

    public List<Bus> all() {
        return busRepository.findAll();
    }

    public Bus save(Bus bus) {
        return busRepository.save(bus);
    }

    public void delete(Long id) {
        busRepository.deleteById(id);
    }
}


