package com.tripwithus.controller;

import com.tripwithus.model.*;
import com.tripwithus.service.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final BusService busService;
    private final CarService carService;
    private final TrainService trainService;
    private final FlightService flightService;
    private final HotelService hotelService;
    private final IssueService issueService;
    private final CouponService couponService;
    private final BookingService bookingService;
    private final RefundService refundService;
    private final ReviewService reviewService;

    public AdminController(BusService busService, CarService carService, TrainService trainService,
                            FlightService flightService, HotelService hotelService, IssueService issueService,
                            CouponService couponService, BookingService bookingService, RefundService refundService,
                            ReviewService reviewService) {
        this.busService = busService;
        this.carService = carService;
        this.trainService = trainService;
        this.flightService = flightService;
        this.hotelService = hotelService;
        this.issueService = issueService;
        this.couponService = couponService;
        this.bookingService = bookingService;
        this.refundService = refundService;
        this.reviewService = reviewService;
    }

    // --- 1. Availability management ---
    @GetMapping("/buses") public List<Bus> buses() { return busService.all(); }
    @PutMapping("/buses/{id}") public Bus updateBus(@PathVariable Long id, @RequestBody Bus bus) { bus.setId(id); return busService.save(bus); }
    @PostMapping("/buses") public Bus createBus(@RequestBody Bus bus) { return busService.save(bus); }
    @DeleteMapping("/buses/{id}") public void deleteBus(@PathVariable Long id) { busService.delete(id); }

    @GetMapping("/cars") public List<Car> cars() { return carService.all(); }
    @PutMapping("/cars/{id}") public Car updateCar(@PathVariable Long id, @RequestBody Car car) { car.setId(id); return carService.save(car); }
    @PostMapping("/cars") public Car createCar(@RequestBody Car car) { return carService.save(car); }
    @DeleteMapping("/cars/{id}") public void deleteCar(@PathVariable Long id) { carService.delete(id); }

    @GetMapping("/trains") public List<Train> trains() { return trainService.all(); }
    @PutMapping("/trains/{id}") public Train updateTrain(@PathVariable Long id, @RequestBody Train train) { train.setId(id); return trainService.save(train); }
    @PostMapping("/trains") public Train createTrain(@RequestBody Train train) { return trainService.save(train); }
    @DeleteMapping("/trains/{id}") public void deleteTrain(@PathVariable Long id) { trainService.delete(id); }

    @GetMapping("/flights") public List<Flight> flights() { return flightService.all(); }
    @PutMapping("/flights/{id}") public Flight updateFlight(@PathVariable Long id, @RequestBody Flight flight) { flight.setId(id); return flightService.save(flight); }
    @PostMapping("/flights") public Flight createFlight(@RequestBody Flight flight) { return flightService.save(flight); }
    @DeleteMapping("/flights/{id}") public void deleteFlight(@PathVariable Long id) { flightService.delete(id); }

    @GetMapping("/hotels") public List<Hotel> hotels() { return hotelService.all(); }
    @PutMapping("/hotels/{id}") public Hotel updateHotel(@PathVariable Long id, @RequestBody Hotel hotel) { hotel.setId(id); return hotelService.save(hotel); }
    @PostMapping("/hotels") public Hotel createHotel(@RequestBody Hotel hotel) { return hotelService.save(hotel); }
    @DeleteMapping("/hotels/{id}") public void deleteHotel(@PathVariable Long id) { hotelService.delete(id); }

    // --- 2. Issue management ---
    @GetMapping("/issues") public List<Issue> issues() { return issueService.all(); }

    @PutMapping("/issues/{id}/resolve")
    public Issue resolveIssue(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Issue.IssueStatus status = Issue.IssueStatus.valueOf(body.getOrDefault("status", "RESOLVED"));
        return issueService.resolve(id, body.get("response"), status);
    }

    // --- 3. Coupon management (festival season discounts) ---
    @GetMapping("/coupons") public List<Coupon> coupons() { return couponService.all(); }
    @PostMapping("/coupons") public Coupon createCoupon(@RequestBody Coupon coupon) { return couponService.create(coupon); }
    @PutMapping("/coupons/{id}/toggle") public Coupon toggleCoupon(@PathVariable Long id, @RequestParam boolean active) { return couponService.toggle(id, active); }

    // --- Bookings / refunds oversight ---
    @GetMapping("/bookings") public List<Booking> allBookings() { return bookingService.all(); }
    @GetMapping("/refunds") public List<Refund> allRefunds() { return refundService.all(); }
    @PutMapping("/refunds/{id}/advance") public Refund advanceRefund(@PathVariable Long id) { return refundService.advanceStatus(id); }

    // --- Review moderation ---
    @GetMapping("/reviews/flagged") public List<Review> flaggedReviews() { return reviewService.flaggedReviews(); }
    @PutMapping("/reviews/{id}/moderate") public Review moderate(@PathVariable Long id, @RequestParam boolean remove) { return reviewService.moderate(id, remove); }

    // --- Dashboard summary ---
    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return Map.of(
                "totalBookings", bookingService.all().size(),
                "totalBuses", busService.all().size(),
                "totalCars", carService.all().size(),
                "totalTrains", trainService.all().size(),
                "totalFlights", flightService.all().size(),
                "totalHotels", hotelService.all().size(),
                "openIssues", issueService.all().stream().filter(i -> i.getStatus() != Issue.IssueStatus.RESOLVED).count(),
                "pendingRefunds", refundService.all().stream().filter(r -> r.getStatus() == Refund.RefundStatus.PENDING).count()
        );
    }
}
