package com.tripwithus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * TRIP-WITH-US
 * A MakeMyTrip-style bus / car / train / flight / hotel booking platform.
 */
@SpringBootApplication
@EnableScheduling
public class TripWithUsApplication {
    public static void main(String[] args) {
        SpringApplication.run(TripWithUsApplication.class, args);
    }
}
