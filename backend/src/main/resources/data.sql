-- ================= BUSES =================
INSERT INTO bus (operator_name, bus_type, from_city, to_city, departure_time, arrival_time, travel_date, total_seats, available_seats, base_price, current_price, rating) VALUES
('RoyalCruiser Travels', 'AC Sleeper', 'Delhi', 'Jaipur', '22:00', '05:30', '2026-07-25', 40, 34, 899.0, 899.0, 4.3),
('GreenLine Express', 'Non-AC Seater', 'Delhi', 'Jaipur', '08:00', '14:00', '2026-07-25', 40, 12, 499.0, 499.0, 3.9),
('Orange Tours', 'AC Sleeper', 'Mumbai', 'Pune', '23:00', '03:00', '2026-07-25', 36, 30, 599.0, 599.0, 4.5),
('SkyLine Volvo', 'AC Seater', 'Bengaluru', 'Chennai', '21:30', '05:00', '2026-07-28', 40, 38, 799.0, 799.0, 4.1),
('Holiday Movers', 'AC Sleeper', 'Delhi', 'Jaipur', '22:00', '05:30', '2026-12-24', 40, 40, 899.0, 899.0, 4.4);

-- ================= CARS =================
INSERT INTO car (car_model, car_type, from_city, to_city, travel_date, pickup_time, seat_capacity, available, base_price, current_price, driver_name, rating) VALUES
('Toyota Etios', 'Sedan', 'Delhi', 'Jaipur', '2026-07-25', '06:00', 4, true, 2999.0, 2999.0, 'Ramesh Kumar', 4.5),
('Mahindra XUV700', 'SUV', 'Delhi', 'Jaipur', '2026-07-25', '07:00', 6, true, 4499.0, 4499.0, 'Suresh Yadav', 4.7),
('Maruti Swift', 'Hatchback', 'Mumbai', 'Pune', '2026-07-25', '09:00', 4, true, 1899.0, 1899.0, 'Anil Sharma', 4.2),
('Honda City', 'Sedan', 'Bengaluru', 'Chennai', '2026-07-28', '05:30', 4, true, 3199.0, 3199.0, 'Karthik Raj', 4.4);

-- ================= TRAINS =================
INSERT INTO train (train_name, train_number, from_city, to_city, departure_time, arrival_time, travel_date, travel_class, total_seats, available_seats, base_price, current_price) VALUES
('Pink City Express', '12958', 'Delhi', 'Jaipur', '06:10', '10:50', '2026-07-25', 'AC 3-Tier', 72, 55, 650.0, 650.0),
('Deccan Queen', '12124', 'Mumbai', 'Pune', '07:15', '10:25', '2026-07-25', 'AC 2-Tier', 60, 20, 450.0, 450.0),
('Shatabdi Express', '12007', 'Chennai', 'Bengaluru', '06:00', '10:30', '2026-07-28', 'AC First', 50, 45, 1200.0, 1200.0),
('Jaipur Holiday Special', '19812', 'Delhi', 'Jaipur', '06:10', '10:50', '2026-12-24', 'Sleeper', 72, 72, 350.0, 350.0);

-- ================= FLIGHTS =================
INSERT INTO flight (airline, flight_number, from_city, to_city, departure_time, arrival_time, travel_date, total_seats, available_seats, base_price, current_price, live_status, delay_reason, revised_departure_time, estimated_arrival) VALUES
('IndiGo', '6E-2031', 'Delhi', 'Jaipur', '09:15', '10:20', '2026-07-25', 180, 140, 2899.0, 2899.0, 'On Time', NULL, '09:15', '10:20'),
('Air India', 'AI-405', 'Mumbai', 'Pune', '14:00', '14:55', '2026-07-25', 150, 30, 3499.0, 3499.0, 'Delayed by 1h', 'Air traffic congestion', '15:00', '15:55'),
('Vistara', 'UK-812', 'Bengaluru', 'Chennai', '18:30', '19:35', '2026-07-28', 168, 160, 3199.0, 3199.0, 'On Time', NULL, '18:30', '19:35'),
('SpiceJet', 'SG-501', 'Delhi', 'Jaipur', '20:00', '21:05', '2026-12-24', 189, 189, 4599.0, 4599.0, 'Boarding', NULL, '20:00', '21:05'),
('IndiGo', '6E-301', 'Pune', 'Mumbai', '09:00', '09:45', '2026-07-25', 120, 35, 2199.0, 2199.0, 'Delayed by 30min', 'Weather conditions', '09:30', '10:15'),
('Vistara', 'UK-955', 'Delhi', 'Bengaluru', '23:00', '01:45', '2026-07-28', 168, 145, 5999.0, 5999.0, 'On Time', NULL, '23:00', '01:45'),
('Akasa Air', 'QP-1200', 'Goa', 'Mumbai', '16:00', '17:15', '2026-07-30', 150, 110, 3299.0, 3299.0, 'On Time', NULL, '16:00', '17:15');

-- ================= HOTELS (15 hotels across 10+ cities) =================
INSERT INTO hotel (hotel_name, location, room_type, total_rooms, available_rooms, base_price, current_price, rating, image_url, amenities) VALUES
('Taj Jai Mahal Palace', 'Jaipur', 'Deluxe', 30, 12, 8999.0, 8999.0, 4.8, 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 'Pool,Spa,Free WiFi,Breakfast'),
('The Leela Goa', 'Goa', 'Suite', 25, 18, 12999.0, 12999.0, 4.7, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9', 'Beach Access,Pool,Bar,Spa'),
('Ginger Pune', 'Pune', 'Standard', 40, 25, 2499.0, 2499.0, 4.0, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa', 'Free WiFi,Parking,Breakfast'),
('ITC Gardenia', 'Bengaluru', 'Deluxe', 35, 30, 7499.0, 7499.0, 4.6, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a', 'Pool,Gym,Free WiFi,Restaurant'),
('Radisson Blu Chennai', 'Chennai', 'Standard', 28, 22, 4999.0, 4999.0, 4.3, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32', 'Free WiFi,Gym,Breakfast'),
('The Oberoi Amarvilas', 'Delhi', 'Suite', 15, 8, 15999.0, 15999.0, 4.9, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791', 'Spa,Pool,Premium Dining,Butler Service,Breakfast'),
('Trident Nariman Point', 'Mumbai', 'Deluxe', 20, 14, 10999.0, 10999.0, 4.7, 'https://images.unsplash.com/photo-1562778612-e1e0cda9915c', 'Pool,Gym,Restaurant,Bar,Free WiFi'),
('Grand Hyatt Kochi', 'Kochi', 'Deluxe', 32, 28, 6999.0, 6999.0, 4.5, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461', 'Pool,Spa,Gym,Restaurant,Free WiFi,Breakfast'),
('The Park Hyderabad', 'Hyderabad', 'Standard', 40, 35, 3999.0, 3999.0, 4.2, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7', 'Free WiFi,Gym,Parking,Rooftop Bar'),
('JW Marriott Kolkata', 'Kolkata', 'Deluxe', 28, 20, 8499.0, 8499.0, 4.6, 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c', 'Pool,Spa,Restaurant,Bar,Free WiFi'),
('Lemon Tree Chandigarh', 'Chandigarh', 'Standard', 36, 30, 3299.0, 3299.0, 4.1, 'https://images.unsplash.com/photo-1590490360182-c33d57733427', 'Free WiFi,Gym,Parking,Breakfast'),
('Taj Lake Palace', 'Udaipur', 'Suite', 18, 6, 19999.0, 19999.0, 4.9, 'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e', 'Lake View,Spa,Pool,Fine Dining,Butler Service'),
('Fort Aguada Beach Resort', 'Goa', 'Deluxe', 22, 15, 7499.0, 7499.0, 4.5, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'Beach Access,Pool,Restaurant,Bar'),
('Novotel Mumbai', 'Mumbai', 'Standard', 38, 32, 5499.0, 5499.0, 4.3, 'https://images.unsplash.com/photo-1590490360182-c33d57733427', 'Free WiFi,Gym,Parking,Restaurant'),
('Rambagh Palace', 'Jaipur', 'Suite', 12, 5, 24999.0, 24999.0, 4.9, 'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e', 'Royal Suite,Spa,Pool,Gourmet Dining,Heritage Walk');

-- ================= COUPONS =================
INSERT INTO coupon (code, description, discount_percent, valid_from, valid_to, active) VALUES
('DIWALI25', 'Festive Diwali offer - 25% off', 25.0, '2026-10-01', '2026-11-15', true),
('WELCOME10', 'New user welcome discount', 10.0, '2026-01-01', '2026-12-31', true),
('SUMMER15', 'Summer travel special', 15.0, '2026-04-01', '2026-08-31', true),
('NEWYEAR30', 'New Year mega sale', 30.0, '2026-12-20', '2027-01-05', true);
