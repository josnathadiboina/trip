package com.tripwithus.dto;

import com.tripwithus.model.Booking;
import lombok.Data;

@Data
public class BookingRequest {
    private Booking.BookingType bookingType;
    private Long referenceId;
    private String fromLocation;
    private String toLocation;
    private String travelDate;
    private String seatNumbers;
    private Integer passengerCount;
    private String passengerDetails;
    private String couponCode;
}
