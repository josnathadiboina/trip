package com.tripwithus.service;

import com.tripwithus.dto.BookingRequest;
import com.tripwithus.model.*;
import com.tripwithus.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BusService busService;
    private final CarService carService;
    private final TrainService trainService;
    private final FlightService flightService;
    private final HotelService hotelService;
    private final SeatService seatService;
    private final CouponService couponService;
    private final RefundService refundService;

    public BookingService(BookingRepository bookingRepository, BusService busService, CarService carService,
                           TrainService trainService, FlightService flightService, HotelService hotelService,
                           SeatService seatService, CouponService couponService, RefundService refundService) {
        this.bookingRepository = bookingRepository;
        this.busService = busService;
        this.carService = carService;
        this.trainService = trainService;
        this.flightService = flightService;
        this.hotelService = hotelService;
        this.seatService = seatService;
        this.couponService = couponService;
        this.refundService = refundService;
    }

    @Transactional
    public Booking createBooking(User user, BookingRequest req) {
        double baseAmount;
        int count = req.getPassengerCount() == null ? 1 : req.getPassengerCount();

        switch (req.getBookingType()) {
            case BUS -> {
                Bus bus = busService.getById(req.getReferenceId());
                if (req.getSeatNumbers() != null && !req.getSeatNumbers().isBlank()) {
                    seatService.bookSeats(Seat.VehicleType.BUS, bus.getId(), Arrays.asList(req.getSeatNumbers().split(",")));
                }
                busService.decrementSeats(bus.getId(), count);
                baseAmount = (bus.getCurrentPrice() != null ? bus.getCurrentPrice() : bus.getBasePrice()) * count;
            }
            case CAR -> {
                Car car = carService.getById(req.getReferenceId());
                carService.markUnavailable(car.getId());
                baseAmount = (car.getCurrentPrice() != null ? car.getCurrentPrice() : car.getBasePrice());
            }
            case TRAIN -> {
                Train train = trainService.getById(req.getReferenceId());
                if (req.getSeatNumbers() != null && !req.getSeatNumbers().isBlank()) {
                    seatService.bookSeats(Seat.VehicleType.TRAIN, train.getId(), Arrays.asList(req.getSeatNumbers().split(",")));
                }
                trainService.decrementSeats(train.getId(), count);
                baseAmount = (train.getCurrentPrice() != null ? train.getCurrentPrice() : train.getBasePrice()) * count;
            }
            case FLIGHT -> {
                Flight flight = flightService.getById(req.getReferenceId());
                if (req.getSeatNumbers() != null && !req.getSeatNumbers().isBlank()) {
                    seatService.bookSeats(Seat.VehicleType.FLIGHT, flight.getId(), Arrays.asList(req.getSeatNumbers().split(",")));
                }
                flightService.decrementSeats(flight.getId(), count);
                baseAmount = (flight.getCurrentPrice() != null ? flight.getCurrentPrice() : flight.getBasePrice()) * count;
            }
            case HOTEL -> {
                Hotel hotel = hotelService.getById(req.getReferenceId());
                hotelService.decrementRooms(hotel.getId(), 1);
                baseAmount = (hotel.getCurrentPrice() != null ? hotel.getCurrentPrice() : hotel.getBasePrice());
            }
            default -> throw new IllegalArgumentException("Unsupported booking type");
        }

        double discount = 0.0;
        if (req.getCouponCode() != null && !req.getCouponCode().isBlank()) {
            Coupon coupon = couponService.validate(req.getCouponCode())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or expired coupon"));
            discount = baseAmount * (coupon.getDiscountPercent() / 100.0);
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setBookingType(req.getBookingType());
        booking.setReferenceId(req.getReferenceId());
        booking.setFromLocation(req.getFromLocation());
        booking.setToLocation(req.getToLocation());
        booking.setTravelDate(req.getTravelDate());
        booking.setSeatNumbers(req.getSeatNumbers());
        booking.setPassengerCount(count);
        booking.setPassengerDetails(req.getPassengerDetails());
        booking.setCouponCode(req.getCouponCode());
        booking.setBaseAmount(baseAmount);
        booking.setDiscountAmount(discount);
        booking.setFinalAmount(baseAmount - discount);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);

        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookedAtDesc(userId);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, Long userId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new SecurityException("Not authorized to cancel this booking");
        }
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking already cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(java.time.LocalDateTime.now());
        bookingRepository.save(booking);

        // release inventory
        int count = booking.getPassengerCount() == null ? 1 : booking.getPassengerCount();
        switch (booking.getBookingType()) {
            case BUS -> busService.incrementSeats(booking.getReferenceId(), count);
            case TRAIN -> trainService.incrementSeats(booking.getReferenceId(), count);
            case FLIGHT -> flightService.incrementSeats(booking.getReferenceId(), count);
            case CAR -> carService.markAvailable(booking.getReferenceId());
            case HOTEL -> hotelService.incrementRooms(booking.getReferenceId(), 1);
        }

        // Auto-calculate refund based on cancellation policy
        refundService.initiateRefund(booking, reason);

        return booking;
    }

    public Booking getById(Long id) {
        return bookingRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Booking not found"));
    }

    public List<Booking> all() { return bookingRepository.findAll(); }
}
