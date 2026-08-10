package com.tripwithus.controller;

import com.tripwithus.model.Car;
import com.tripwithus.service.CarService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CarController {
    private final CarService carService;

    public CarController(CarService carService) { this.carService = carService; }

    @GetMapping("/search/cars")
    public List<Car> search(@RequestParam String from, @RequestParam String to, @RequestParam String date) {
        return carService.search(from, to, date);
    }

    @GetMapping("/cars/{id}")
    public Car get(@PathVariable Long id) { return carService.getById(id); }
}
