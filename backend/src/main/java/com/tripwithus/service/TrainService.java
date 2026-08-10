package com.tripwithus.service;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Train;
import com.tripwithus.repository.TrainRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainService {
    private final TrainRepository trainRepository;
    private final PricingService pricingService;

    public TrainService(TrainRepository trainRepository, PricingService pricingService) {
        this.trainRepository = trainRepository;
        this.pricingService = pricingService;
    }

    public List<Train> search(String from, String to, String date) {
        List<Train> trains = trainRepository.findByFromCityIgnoreCaseAndToCityIgnoreCaseAndTravelDate(from, to, date);
        trains.forEach(t -> t.setCurrentPrice(pricingService.computeDynamicPrice(
                Booking.BookingType.TRAIN, t.getId(), t.getBasePrice(), t.getTotalSeats(), t.getAvailableSeats(), date)));
        return trains;
    }

    public Train getById(Long id) {
        return trainRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Train not found"));
    }

    public Train decrementSeats(Long id, int count) {
        Train train = getById(id);
        train.setAvailableSeats(Math.max(0, train.getAvailableSeats() - count));
        return trainRepository.save(train);
    }

    public Train incrementSeats(Long id, int count) {
        Train train = getById(id);
        train.setAvailableSeats(Math.min(train.getTotalSeats(), train.getAvailableSeats() + count));
        return trainRepository.save(train);
    }

public List<Train> all() { return trainRepository.findAll(); }
    public Train save(Train t) { return trainRepository.save(t); }
    public void delete(Long id) { trainRepository.deleteById(id); }
}
