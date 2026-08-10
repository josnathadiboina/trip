package com.tripwithus.service;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Hotel;
import com.tripwithus.repository.HotelRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HotelService {
    private final HotelRepository hotelRepository;
    private final PricingService pricingService;

    public HotelService(HotelRepository hotelRepository, PricingService pricingService) {
        this.hotelRepository = hotelRepository;
        this.pricingService = pricingService;
    }

    public List<Hotel> search(String location, String date) {
        List<Hotel> hotels = hotelRepository.findByLocationIgnoreCaseContaining(location);
        hotels.forEach(h -> h.setCurrentPrice(pricingService.computeDynamicPrice(
                Booking.BookingType.HOTEL, h.getId(), h.getBasePrice(), h.getTotalRooms(), h.getAvailableRooms(), date)));
        return hotels;
    }

    public Hotel getById(Long id) {
        return hotelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Hotel not found"));
    }

    public Hotel decrementRooms(Long id, int count) {
        Hotel hotel = getById(id);
        hotel.setAvailableRooms(Math.max(0, hotel.getAvailableRooms() - count));
        return hotelRepository.save(hotel);
    }

    public Hotel incrementRooms(Long id, int count) {
        Hotel hotel = getById(id);
        hotel.setAvailableRooms(Math.min(hotel.getTotalRooms(), hotel.getAvailableRooms() + count));
        return hotelRepository.save(hotel);
    }

public List<Hotel> all() { return hotelRepository.findAll(); }
    public Hotel save(Hotel h) { return hotelRepository.save(h); }
    public void delete(Long id) { hotelRepository.deleteById(id); }
}
