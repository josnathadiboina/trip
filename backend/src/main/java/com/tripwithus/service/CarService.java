package com.tripwithus.service;

import com.tripwithus.model.Booking;
import com.tripwithus.model.Car;
import com.tripwithus.repository.CarRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarService {
    private final CarRepository carRepository;
    private final PricingService pricingService;

    public CarService(CarRepository carRepository, PricingService pricingService) {
        this.carRepository = carRepository;
        this.pricingService = pricingService;
    }

    public List<Car> search(String from, String to, String date) {
        List<Car> cars = carRepository.findByFromCityIgnoreCaseAndToCityIgnoreCaseAndTravelDate(from, to, date);
        cars.forEach(c -> c.setCurrentPrice(pricingService.computeDynamicPrice(
                Booking.BookingType.CAR, c.getId(), c.getBasePrice(), c.getSeatCapacity(), c.getAvailable() ? c.getSeatCapacity() : 0, date)));
        return cars;
    }

    public Car getById(Long id) {
        return carRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Car not found"));
    }

    public Car markUnavailable(Long id) {
        Car car = getById(id);
        car.setAvailable(false);
        return carRepository.save(car);
    }

    public Car markAvailable(Long id) {
        Car car = getById(id);
        car.setAvailable(true);
        return carRepository.save(car);
    }

    public List<Car> all() {
        return carRepository.findAll();
    }

    public Car save(Car car) {
        return carRepository.save(car);
    }

    public void delete(Long id) {
        carRepository.deleteById(id);
    }
}
