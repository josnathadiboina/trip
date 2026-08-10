/* ============================================================
   MOCK API — Intercepts all API calls with realistic mock data
   Dynamic pricing based on route distance + transport mode.
   ============================================================ */

/* ---------- Route distance database (km) ---------- */
const ROUTE_DISTANCES = {
  'delhi-jaipur': 280,
  'delhi-mumbai': 1400,
  'delhi-bengaluru': 2200,
  'delhi-chennai': 2100,
  'delhi-goa': 1800,
  'delhi-pune': 1450,
  'mumbai-pune': 150,
  'mumbai-goa': 580,
  'mumbai-bengaluru': 980,
  'mumbai-chennai': 1380,
  'mumbai-jaipur': 1180,
  'mumbai-delhi': 1400,
  'bengaluru-chennai': 350,
  'bengaluru-mumbai': 980,
  'bengaluru-delhi': 2200,
  'bengaluru-pune': 840,
  'bengaluru-goa': 580,
  'chennai-bengaluru': 350,
  'chennai-mumbai': 1380,
  'chennai-delhi': 2100,
  'chennai-pune': 1050,
  'chennai-jaipur': 2000,
  'pune-mumbai': 150,
  'pune-delhi': 1450,
  'pune-bengaluru': 840,
  'pune-goa': 450,
  'goa-mumbai': 580,
  'goa-bengaluru': 580,
  'goa-pune': 450,
  'goa-delhi': 1800,
  'jaipur-delhi': 280,
  'jaipur-mumbai': 1180,
  'jaipur-chennai': 2000,
};

function getRouteKey(from, to) {
  const a = from.toLowerCase().trim();
  const b = to.toLowerCase().trim();
  return ROUTE_DISTANCES[a + '-' + b] ? a + '-' + b : b + '-' + a;
}

function getDistance(from, to) {
  return ROUTE_DISTANCES[getRouteKey(from, to)] || 500;
}

function calcDynamicPrice(basePricePerKm, distance, transportMode, demandFactor) {
  let price = distance * basePricePerKm;
  const modeMultipliers = { bus: 1.0, car: 2.5, train: 0.8, flight: 4.0 };
  price *= (modeMultipliers[transportMode] || 1.0);
  price *= demandFactor;
  return Math.round(price / 50) * 50;
}

function randomDemandFactor() {
  return 0.85 + (Math.random() * 0.55);
}

function randomAvailableSeats(total, min) {
  const max = Math.max(min, total - 5);
  return Math.floor(Math.random() * (max - min) + min);
}

function timeAdd(timeStr, hours) {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMin = h * 60 + m + Math.round(hours * 60);
  const newH = Math.floor(totalMin / 60) % 24;
  const newM = totalMin % 60;
  return String(newH).padStart(2, '0') + ':' + String(newM).padStart(2, '0');
}

function travelTimeHours(distance, speedKmh) {
  return distance / speedKmh;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const BUS_OPERATORS = [
  { name: 'RoyalCruiser Travels', type: 'AC Sleeper', speed: 45, rating: 4.3, baseRate: 2.5 },
  { name: 'GreenLine Express', type: 'Non-AC Seater', speed: 50, rating: 3.9, baseRate: 1.2 },
  { name: 'Orange Tours', type: 'AC Sleeper', speed: 42, rating: 4.5, baseRate: 2.8 },
  { name: 'SkyLine Volvo', type: 'AC Seater', speed: 55, rating: 4.1, baseRate: 2.0 },
  { name: 'Holiday Movers', type: 'AC Sleeper', speed: 44, rating: 4.4, baseRate: 2.6 },
  { name: 'KPN Travels', type: 'AC Sleeper', speed: 43, rating: 4.6, baseRate: 3.0 },
  { name: 'IntrCity SmartBus', type: 'AC Seater', speed: 52, rating: 4.2, baseRate: 2.2 },
  { name: 'VRL Travels', type: 'AC Sleeper', speed: 41, rating: 4.4, baseRate: 2.7 },
  { name: 'SRS Travels', type: 'Non-AC Seater', speed: 48, rating: 4.1, baseRate: 1.0 },
  { name: 'CityLink Express', type: 'AC Seater', speed: 58, rating: 4.0, baseRate: 1.8 },
  { name: 'Neeta Tours', type: 'AC Sleeper', speed: 40, rating: 4.5, baseRate: 3.2 },
  { name: 'Sharma Travels', type: 'Non-AC Sleeper', speed: 46, rating: 3.8, baseRate: 1.5 },
  { name: 'Singh Bus Service', type: 'AC Sleeper', speed: 44, rating: 4.0, baseRate: 2.4 },
  { name: 'Laxmi Holidays', type: 'AC Seater', speed: 54, rating: 4.2, baseRate: 2.1 },
  { name: 'Raj Express', type: 'AC Sleeper', speed: 42, rating: 4.3, baseRate: 2.9 },
  { name: 'BlueBus Travels', type: 'AC Sleeper', speed: 45, rating: 4.5, baseRate: 2.6 },
  { name: 'RedBus Partner', type: 'Non-AC Seater', speed: 50, rating: 3.7, baseRate: 1.1 },
  { name: 'Morning Star Travels', type: 'AC Seater', speed: 56, rating: 4.1, baseRate: 1.9 },
  { name: 'Sai Ram Travels', type: 'AC Sleeper', speed: 43, rating: 4.4, baseRate: 2.5 },
  { name: 'Comfort Lines', type: 'AC Sleeper', speed: 40, rating: 4.6, baseRate: 3.1 },
];

function generateMockBuses(from, to, date, count) {
  const distance = getDistance(from, to);
  const shuffled = [...BUS_OPERATORS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map((op, idx) => {
    const travelHours = travelTimeHours(distance, op.speed);
    const departureHour = 6 + Math.floor(Math.random() * 16);
    const depTime = String(departureHour).padStart(2, '0') + ':' + String(Math.random() > 0.5 ? '00' : '30');
    const arrTime = timeAdd(depTime, travelHours);
    const demand = randomDemandFactor();
    const price = calcDynamicPrice(op.baseRate, distance, 'bus', demand);
    const totalSeats = 40;
    const availSeats = randomAvailableSeats(totalSeats, 5);
    return { id: 1000 + idx, operatorName: op.name, busType: op.type, fromCity: from, toCity: to, departureTime: depTime, arrivalTime: arrTime, travelDate: date, totalSeats: totalSeats, availableSeats: availSeats, basePrice: price, currentPrice: price, rating: op.rating };
  });
}

const CAR_MODELS = [
  { model: 'Toyota Etios', type: 'Sedan', seats: 4, rate: 8, rating: 4.5 },
  { model: 'Mahindra XUV700', type: 'SUV', seats: 6, rate: 12, rating: 4.7 },
  { model: 'Maruti Swift', type: 'Hatchback', seats: 4, rate: 5, rating: 4.2 },
  { model: 'Honda City', type: 'Sedan', seats: 4, rate: 9, rating: 4.4 },
  { model: 'Toyota Innova Crysta', type: 'SUV', seats: 7, rate: 14, rating: 4.8 },
  { model: 'Hyundai i20', type: 'Hatchback', seats: 4, rate: 6, rating: 4.3 },
  { model: 'Mercedes Benz E-Class', type: 'Luxury Sedan', seats: 4, rate: 18, rating: 4.9 },
  { model: 'Ford EcoSport', type: 'SUV', seats: 5, rate: 7, rating: 4.5 },
  { model: 'Honda Amaze', type: 'Sedan', seats: 4, rate: 5.5, rating: 4.1 },
  { model: 'Tata Harrier', type: 'SUV', seats: 5, rate: 10, rating: 4.6 },
  { model: 'Hyundai Creta', type: 'SUV', seats: 5, rate: 9, rating: 4.4 },
  { model: 'Maruti Brezza', type: 'SUV', seats: 5, rate: 7.5, rating: 4.3 },
  { model: 'Toyota Fortuner', type: 'SUV', seats: 7, rate: 15, rating: 4.8 },
  { model: 'Volkswagen Virtus', type: 'Sedan', seats: 5, rate: 8, rating: 4.2 },
  { model: 'Kia Seltos', type: 'SUV', seats: 5, rate: 8.5, rating: 4.4 },
  { model: 'Skoda Slavia', type: 'Sedan', seats: 5, rate: 7.5, rating: 4.3 },
  { model: 'Nissan Magnite', type: 'SUV', seats: 5, rate: 6.5, rating: 4.1 },
  { model: 'Renault Kwid', type: 'Hatchback', seats: 4, rate: 4, rating: 3.9 },
  { model: 'MG Hector', type: 'SUV', seats: 5, rate: 11, rating: 4.5 },
  { model: 'Jeep Compass', type: 'SUV', seats: 5, rate: 13, rating: 4.6 },
];

const CAR_DRIVERS = [
  'Ramesh Kumar', 'Suresh Yadav', 'Anil Sharma', 'Karthik Raj', 'Vikram Singh',
  'Prasad Joshi', 'Gopal Rao', 'Venkatesh Iyer', 'Sanjay Patil', 'Dilip Verma',
  'Manoj Tiwari', 'Rajesh Gupta', 'Amit Patel', 'Prakash Nair', 'Siddharth Menon',
];

function generateMockCars(from, to, date, count) {
  const distance = getDistance(from, to);
  const shuffled = [...CAR_MODELS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map((cm, idx) => {
    const demand = randomDemandFactor();
    const price = calcDynamicPrice(cm.rate, distance, 'car', demand);
    const pickupHour = 4 + Math.floor(Math.random() * 16);
    const pickup = String(pickupHour).padStart(2, '0') + ':' + String(Math.random() > 0.5 ? '00' : '30');
    const driver = CAR_DRIVERS[Math.floor(Math.random() * CAR_DRIVERS.length)];
    return { id: 2000 + idx, carModel: cm.model, carType: cm.type, fromCity: from, toCity: to, travelDate: date, pickupTime: pickup, seatCapacity: cm.seats, available: true, basePrice: price, currentPrice: price, driverName: driver, rating: cm.rating };
  });
}

const TRAIN_DATA = [
  { name: 'Pink City Express', num: '12958', cls: 'AC 3-Tier', speed: 55, rate: 1.8 },
  { name: 'Deccan Queen', num: '12124', cls: 'AC 2-Tier', speed: 60, rate: 2.5 },
  { name: 'Shatabdi Express', num: '12007', cls: 'AC First', speed: 65, rate: 3.5 },
  { name: 'Jaipur Holiday Special', num: '19812', cls: 'Sleeper', speed: 50, rate: 1.0 },
  { name: 'Rajdhani Express', num: '12431', cls: 'AC 3-Tier', speed: 70, rate: 3.0 },
  { name: 'Mandovi Express', num: '10103', cls: 'Sleeper', speed: 45, rate: 0.8 },
  { name: 'Karnataka Express', num: '12627', cls: 'Sleeper', speed: 48, rate: 0.9 },
  { name: 'Chennai Express', num: '12603', cls: 'AC Chair Car', speed: 62, rate: 2.8 },
  { name: 'Intercity Express', num: '12125', cls: 'AC Chair Car', speed: 68, rate: 2.2 },
  { name: 'Duronto Express', num: '12213', cls: 'AC 3-Tier', speed: 72, rate: 3.2 },
  { name: 'Garib Rath', num: '12215', cls: 'AC 3-Tier', speed: 58, rate: 1.5 },
  { name: 'Kolkata Mail', num: '12301', cls: 'Sleeper', speed: 46, rate: 1.1 },
  { name: 'Konkan Kanya Express', num: '10111', cls: 'AC 3-Tier', speed: 50, rate: 1.6 },
  { name: 'Netravati Express', num: '16345', cls: 'AC 2-Tier', speed: 52, rate: 2.0 },
  { name: 'Goa Express', num: '12779', cls: 'Sleeper', speed: 44, rate: 1.2 },
  { name: 'Udyan Express', num: '16529', cls: 'AC 3-Tier', speed: 54, rate: 1.8 },
];

function generateMockTrains(from, to, date, count) {
  const distance = getDistance(from, to);
  const shuffled = [...TRAIN_DATA].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map((td, idx) => {
    const travelHours = travelTimeHours(distance, td.speed);
    const departureHour = 5 + Math.floor(Math.random() * 18);
    const depTime = String(departureHour).padStart(2, '0') + ':' + String(Math.random() > 0.5 ? '00' : '30');
    const arrTime = timeAdd(depTime, travelHours);
    const demand = randomDemandFactor();
    const price = calcDynamicPrice(td.rate, distance, 'train', demand);
    const totalSeats = 72;
    const availSeats = randomAvailableSeats(totalSeats, 8);
    return { id: 3000 + idx, trainName: td.name, trainNumber: td.num, fromCity: from, toCity: to, departureTime: depTime, arrivalTime: arrTime, travelDate: date, travelClass: td.cls, totalSeats: totalSeats, availableSeats: availSeats, basePrice: price, currentPrice: price };
  });
}

const AIRLINES = [
  { name: 'IndiGo', code: '6E', rate: 6, rating: 4.0 },
  { name: 'Air India', code: 'AI', rate: 7.5, rating: 4.2 },
  { name: 'Vistara', code: 'UK', rate: 8, rating: 4.5 },
  { name: 'SpiceJet', code: 'SG', rate: 5.5, rating: 3.8 },
  { name: 'Akasa Air', code: 'QP', rate: 6.5, rating: 4.1 },
  { name: 'IndiGo', code: '6E', rate: 6, rating: 4.0 },
  { name: 'Go First', code: 'G8', rate: 5.8, rating: 3.9 },
  { name: 'Air Asia', code: 'I5', rate: 5.0, rating: 3.7 },
];

const FLIGHT_STATUSES = ['On Time', 'On Time', 'On Time', 'Delayed by 30min', 'Delayed by 1h', 'Boarding', 'Boarding'];

function generateMockFlights(from, to, date, count) {
  const distance = getDistance(from, to);
  const shuffled = [...AIRLINES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map((al, idx) => {
    const flightMinutes = Math.round(distance / 8);
    const flightHours = flightMinutes / 60;
    const departureHour = 5 + Math.floor(Math.random() * 16);
    const depTime = String(departureHour).padStart(2, '0') + ':' + String(Math.random() > 0.5 ? '00' : '30');
    const arrTime = timeAdd(depTime, flightHours);
    const demand = randomDemandFactor();
    const price = calcDynamicPrice(al.rate, distance, 'flight', demand);
    const flightNum = al.code + '-' + (200 + Math.floor(Math.random() * 800));
    const status = FLIGHT_STATUSES[Math.floor(Math.random() * FLIGHT_STATUSES.length)];
    const totalSeats = 180;
    const availSeats = randomAvailableSeats(totalSeats, 10);
    const isDelayed = status.startsWith('Delayed');
    const delayMins = isDelayed ? parseInt(status.match(/\d+/)[0]) || 30 : 0;
    return { id: 4000 + idx, airline: al.name, flightNumber: flightNum, fromCity: from, toCity: to, departureTime: depTime, arrivalTime: arrTime, travelDate: date, totalSeats: totalSeats, availableSeats: availSeats, basePrice: price, currentPrice: price, liveStatus: status, delayReason: isDelayed ? (Math.random() > 0.5 ? 'Air traffic congestion' : 'Weather conditions') : null, revisedDepartureTime: isDelayed ? timeAdd(depTime, delayMins / 60) : depTime, estimatedArrival: isDelayed ? timeAdd(arrTime, delayMins / 60) : arrTime, rating: al.rating };
  });
}

function generateMockSeats(totalSeats, alreadyBooked, vehicleType) {
  const seats = [];
  const premiumCount = Math.floor(totalSeats * 0.2);
  const safeBooked = Math.min(alreadyBooked, totalSeats);
  const bookedIndices = new Set();
  while (bookedIndices.size < safeBooked) {
    bookedIndices.add(Math.floor(Math.random() * totalSeats));
  }
  for (let i = 0; i < totalSeats; i++) {
    const isPremium = vehicleType !== 'CAR' && i < premiumCount;
    seats.push({ id: vehicleType === 'BUS' ? 'B' + (i + 1) : vehicleType === 'TRAIN' ? 'T' + (i + 1) : 'F' + (i + 1), seatNumber: String(i + 1), seatClass: isPremium ? 'Premium' : 'Standard', booked: bookedIndices.has(i), priceDelta: isPremium ? 250 : 0, vehicleType: vehicleType, vehicleId: 0 });
  }
  return seats;
}

/* ---------- Mock Hotels (location-aware generator) ---------- */
/* Every city — including ones not in a static catalog (e.g. Trichy, Guntur) —
   gets its OWN unique hotels. Hotel names embed the city, and each hotel gets
   a REAL hotel photo (Unsplash) chosen per-city so different cities show
   different, relevant hotel images. */
/* Real hotel images from loremflickr.com (reliable, key-free, always serves a
   matching hotel/resort photo). Each hotel uses a unique stable `lock` so its
   image is deterministic and distinct from every other hotel/room. The page
   also has an onerror fallback so a photo can never break the layout. */
const HOTEL_IMAGE_POOL = (function() {
  var arr = [];
  for (var i = 1; i <= 20; i++) {
    arr.push('https://loremflickr.com/800/600/hotel,resort,inn?lock=' + i);
  }
  return arr;
})();

const NEW_HOTEL_IMAGES = HOTEL_IMAGE_POOL;

const NEW_ROOM_IMAGES = [
  'https://loremflickr.com/800/600/bedroom,hotelroom?lock=101',
  'https://loremflickr.com/800/600/suite,hotelroom?lock=102',
  'https://loremflickr.com/800/600/hotel,luxury?lock=103'
];

/* Expose image sets globally so page scripts (e.g. hotel.js) can reuse them. */
window.HOTEL_IMAGES = NEW_HOTEL_IMAGES;
window.ROOM_IMAGES = NEW_ROOM_IMAGES;

/* Per-location hotel catalog: each entry is a full hotel with its own details. */
const HOTEL_CATALOG = {
  goa: [
    { name: 'Casa De Goa Beach Resort', rating: 4.8, rate: 6.5, rooms: 28, uni: 0, amenities: 'Ocean View,Private Beach,Pool,Spa,Free WiFi,Bar', desc: 'Beachfront resort with infinity pool and sunset views over the Arabian Sea.' },
    { name: 'Calangute Bay Suites', rating: 4.4, rate: 4.2, rooms: 45, uni: 1, amenities: 'Free WiFi,Pool,Breakfast,Restaurant,Bar', desc: 'Modern suites steps from Calangute beach, rooftop dining and live music.' },
    { name: 'Palolem Palm Retreat', rating: 4.6, rate: 5.0, rooms: 18, uni: 2, amenities: 'Beach Access,Airport Transfer,Spa,Free WiFi', desc: 'Tranquil cottages amid paddy fields, 5 minutes from quiet Palolem beach.' },
    { name: 'Baga Bliss Villa', rating: 4.2, rate: 3.8, rooms: 12, uni: 3, amenities: 'Private Pool,Kitchen,Free WiFi,Parking', desc: 'Private villa near Baga nightlife with a personal pool and chef on call.' }
  ],
  jaipur: [
    { name: 'The Pink Palace Heritage', rating: 4.7, rate: 5.8, rooms: 22, uni: 4, amenities: 'Heritage Decor,Rooftop Restaurant,Pool,Spa,Free WiFi', desc: 'A restored haveli with royal courtyards, near Hawa Mahal and City Palace.' },
    { name: 'Amer View Boutique', rating: 4.5, rate: 4.0, rooms: 30, uni: 5, amenities: 'Free WiFi,Breakfast,Airport Transfer,Restaurant', desc: 'Modern boutique with panoramic views of Amber Fort and Aravalli hills.' },
    { name: 'Rajasthan Royal Stay', rating: 4.3, rate: 3.6, rooms: 35, uni: 6, amenities: 'Free WiFi,Lake View,Restaurant,Parking', desc: 'Comfortable heritage-styled rooms overlooking Mansagar Lake.' }
  ],
  mumbai: [
    { name: 'Marine Drive Grand', rating: 4.6, rate: 6.0, rooms: 40, uni: 7, amenities: 'Ocean View,Pool,Gym,Room Service,Free WiFi', desc: 'Sea-facing luxury tower on Marine Drive, minutes from Gateway of India.' },
    { name: 'Bandra Skyline Suites', rating: 4.4, rate: 4.8, rooms: 32, uni: 8, amenities: 'Free WiFi,City View,Restaurant,Bar,Gym', desc: 'High-rise suites in Bandra with skyline views and a rooftop bar.' },
    { name: 'Airport Transit Lodge', rating: 4.1, rate: 3.2, rooms: 55, uni: 9, amenities: 'Free WiFi,Airport Shuttle,Breakfast', desc: 'Convenient stay near Mumbai airport with 24x7 shuttle and quick check-in.' }
  ],
  delhi: [
    { name: 'Connaught Regal Hotel', rating: 4.5, rate: 5.2, rooms: 38, uni: 10, amenities: 'Free WiFi,Restaurant,Bar,Gym,Airport Transfer', desc: 'Elegant hotel in the heart of Connaught Place close to India Gate.' },
    { name: 'Hauz Khas Heritage House', rating: 4.6, rate: 4.9, rooms: 16, uni: 11, amenities: 'Free WiFi,Lake View,Rooftop Cafe,Parking', desc: 'Boutique stay overlooking Hauz Khas lake with a bohemian rooftop cafe.' },
    { name: 'Aerocity Business Stay', rating: 4.3, rate: 4.4, rooms: 60, uni: 12, amenities: 'Free WiFi,Gym,Restaurant,Airport Shuttle', desc: 'Modern business hotel in Aerocity, tailored for corporate travellers.' }
  ],
  manali: [
    { name: 'Snowpeak Mountain Resort', rating: 4.8, rate: 6.2, rooms: 24, uni: 13, amenities: 'Mountain View,Fireplace,Spa,Breakfast,Free WiFi', desc: 'Cosy alpine resort with roaring fireplaces and panoramic Himalayan views.' },
    { name: 'Solang Valley Cottages', rating: 4.5, rate: 4.6, rooms: 14, uni: 14, amenities: 'Mountain View,Free WiFi,Parking,Bonfire', desc: 'Rustic cottages near Solang Valley perfect for adventure travellers.' },
    { name: 'Mall Road Comfort Inn', rating: 4.2, rate: 3.9, rooms: 30, uni: 15, amenities: 'Free WiFi,Restaurant,Heater,Parking', desc: 'Centrally located stay on Mall Road with warm rooms and local cuisine.' }
  ],
  bengaluru: [
    { name: 'MG Road Tech Suites', rating: 4.3, rate: 4.7, rooms: 42, uni: 16, amenities: 'Free WiFi,Gym,Restaurant,Bar,Co-working', desc: 'Smart suites on MG Road with co-working spaces and high-speed internet.' },
    { name: 'Indiranagar Garden Stay', rating: 4.4, rate: 4.1, rooms: 26, uni: 17, amenities: 'Free WiFi,Garden,Cafe,Parking', desc: 'Green boutique hotel in lively Indiranagar, close to cafes and breweries.' },
    { name: 'Whitefield Business Hotel', rating: 4.1, rate: 4.0, rooms: 50, uni: 18, amenities: 'Free WiFi,Gym,Breakfast,Airport Shuttle', desc: 'Convenient base near Whitefield IT parks with frequent shuttle service.' }
  ],
  chennai: [
    { name: 'Marina Bay Grand', rating: 4.5, rate: 5.0, rooms: 36, uni: 19, amenities: 'Sea View,Pool,Restaurant,Free WiFi', desc: 'Seafront hotel along Marina Beach with sweeping ocean views.' },
    { name: 'T Nagar Comfort Residence', rating: 4.2, rate: 3.5, rooms: 44, uni: 20, amenities: 'Free WiFi,Breakfast,Restaurant,Parking', desc: 'Affordable, well-connected stay in the shopping hub of T Nagar.' },
    { name: 'OMR Business Gateway', rating: 4.0, rate: 3.8, rooms: 48, uni: 21, amenities: 'Free WiFi,Gym,Restaurant,Airport Shuttle', desc: 'Practical hotel on OMR, ideal for business travellers and IT professionals.' }
  ],
  pune: [
    { name: 'Koregaon Park Villa', rating: 4.6, rate: 5.5, rooms: 20, uni: 22, amenities: 'Free WiFi,Garden,Restaurant,Bar,Pool', desc: 'Luxurious villa in Koregaon Park surrounded by lush greenery.' },
    { name: 'Hinjewadi Tech Stay', rating: 4.1, rate: 3.6, rooms: 52, uni: 23, amenities: 'Free WiFi,Gym,Breakfast,Airport Shuttle', desc: 'Budget-friendly hotel near Hinjewadi IT park with coworking lounges.' },
    { name: 'FC Road Suites', rating: 4.3, rate: 4.2, rooms: 28, uni: 24, amenities: 'Free WiFi,Restaurant,Cafe,Parking', desc: 'Modern suites on FC Road surrounded by cafes, shopping and nightlife.' }
  ],
  udaipur: [
    { name: 'Lake Pichola Palace', rating: 4.9, rate: 7.5, rooms: 15, uni: 25, amenities: 'Lake View,Heritage Decor,Rooftop Dinner,Free WiFi', desc: 'A majestic palace hotel right on Lake Pichola with royal lake-view suites.' },
    { name: 'City Palace Haveli', rating: 4.6, rate: 5.6, rooms: 18, uni: 26, amenities: 'Heritage Decor,Free WiFi,Restaurant,Parking', desc: 'Charming haveli near the City Palace with painted murals and courtyards.' },
    { name: 'Fateh Sagar View Stay', rating: 4.3, rate: 4.0, rooms: 25, uni: 27, amenities: 'Lake View,Free WiFi,Breakfast', desc: 'Peaceful stay beside Fateh Sagar Lake with stunning water views.' }
  ],
  pondicherry: [
    { name: 'White Town Heritage Villa', rating: 4.7, rate: 5.4, rooms: 12, uni: 28, amenities: 'Heritage Decor,Free WiFi,Cafe,Beach Access', desc: 'Colonial villa in the French Quarter with pastel walls and courtyard cafes.' },
    { name: 'Promenade Beach Hotel', rating: 4.5, rate: 4.8, rooms: 22, uni: 29, amenities: 'Sea View,Free WiFi,Rooftop Restaurant', desc: 'Sea-view rooms along the famous Promenade Beach stretch.' },
    { name: 'Auroville Serenity Stay', rating: 4.4, rate: 4.2, rooms: 16, uni: 30, amenities: 'Free WiFi,Garden,Breakfast,Parking', desc: 'Calm eco-friendly stay near Auroville, surrounded by gardens and quiet.' }
  ],
  mysuru: [
    { name: 'Palace View Heritage', rating: 4.6, rate: 4.9, rooms: 20, uni: 31, amenities: 'Heritage Decor,Free WiFi,Restaurant,Parking', desc: 'Elegant heritage hotel with views of the illuminated Mysuru Palace.' },
    { name: 'Chamundi Hills Retreat', rating: 4.3, rate: 3.9, rooms: 24, uni: 32, amenities: 'Garden View,Free WiFi,Breakfast', desc: 'Quiet retreat at the foothills of Chamundi Hills with lush gardens.' },
    { name: 'Central Market Lodge', rating: 4.0, rate: 3.0, rooms: 34, uni: 33, amenities: 'Free WiFi,Restaurant,Breakfast', desc: 'Budget-friendly stay near the city centre, ideal for sightseeing.' }
  ]
};

function normalizeLocation(loc) {
  var key = String(loc || '').toLowerCase().trim().split(/[\s,/]+/)[0];
  // Map common alternatives to the canonical catalog key so users still get
  // the city's own distinct hotels (never a wrong-city fallback).
  var aliases = {
    'bangalore': 'bengaluru',
    'bengaluru': 'bengaluru',
    'bombay': 'mumbai',
    'madras': 'chennai',
    'cochin': 'kochi',
    'kochin': 'kochi',
    'new delhi': 'delhi',
    'punducherry': 'pondicherry',
    'puducherry': 'pondicherry',
    'mysore': 'mysuru',
    'mangalore': 'mangaluru',
    'kochi': 'kochi',
    'hyderabad': 'hyderabad',
    'kolkata': 'kolkata',
    'goa': 'goa',
    'jaipur': 'jaipur',
    'mumbai': 'mumbai',
    'delhi': 'delhi',
    'manali': 'manali',
    'chennai': 'chennai',
    'pune': 'pune',
    'udaipur': 'udaipur',
    'pondicherry': 'pondicherry',
    'mysuru': 'mysuru'
  };
  return aliases[key] || key;
}

function titleCase(s) {
  s = String(s || '').replace(/[_-]+/g, ' ').trim();
  return s.split(/\s+/).map(function(w){ return w ? w.charAt(0).toUpperCase() + w.slice(1) : ''; }).join(' ');
}

function hashStr(str) {
  var h = 0;
  str = String(str || '');
  for (var i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function generateMockHotels(location, date, count) {
  const locKey = normalizeLocation(location);
  const cityTitle = titleCase(location) || 'Heritage City';
  const cityList = HOTEL_CATALOG[locKey];
  const totalCount = count || 8;

  // Known cities -> use their curated hotels, each with its own real hotel image.
  if (cityList) {
    const selected = cityList.slice(0, Math.min(totalCount, cityList.length));
    return selected.map((h, idx) => {
      const basePrice = Math.round((h.rate * 1000) + (Math.random() * 500));
      const demand = randomDemandFactor();
      const currentPrice = Math.round(basePrice * demand / 100) * 100;
      const availRooms = Math.floor(h.rooms * (0.3 + Math.random() * 0.5));
      return {
        id: 5000 + (locKey.charCodeAt(0) || 0) * 100 + idx,
        hotelName: h.name + ', ' + location,
        location: location,
        roomType: 'Deluxe',
        totalRooms: h.rooms,
        availableRooms: availRooms,
        basePrice: basePrice,
        currentPrice: currentPrice,
        rating: h.rating,
        description: h.desc,
        imageUrl: NEW_HOTEL_IMAGES[(h.uni != null ? h.uni : idx) % NEW_HOTEL_IMAGES.length],
        amenities: h.amenities
      };
    });
  }

  // Unknown city (e.g. Trichy, Guntur): generate its OWN unique hotels so it
  // NEVER shares names or starting images with any other city.
  const templates = [
    { suffix: 'Grand',      rate: 4.8, rooms: 40, rating: 4.5, am: 'Free WiFi,Restaurant,Pool,Gym,Parking', desc: 'A premium city-centre hotel with modern amenities and warm hospitality.' },
    { suffix: 'Regency',    rate: 4.2, rooms: 50, rating: 4.3, am: 'Free WiFi,Breakfast,Restaurant,Parking', desc: 'Comfortable rooms and excellent dining close to the main attractions.' },
    { suffix: 'Palace',     rate: 5.6, rooms: 24, rating: 4.7, am: 'Heritage Decor,Free WiFi,Restaurant,Spa', desc: 'An elegant stay blending local heritage with plush modern comforts.' },
    { suffix: 'Plaza',      rate: 3.9, rooms: 60, rating: 4.1, am: 'Free WiFi,Restaurant,Cafe,Parking', desc: 'A friendly, well-located hotel perfect for both business and leisure.' },
    { suffix: 'Suites',     rate: 4.6, rooms: 30, rating: 4.6, am: 'Free WiFi,Gym,Rooftop Cafe,Restaurant', desc: 'Trendy boutique suites with stylish interiors and rooftop dining.' },
    { suffix: 'Comfort Inn',rate: 3.4, rooms: 44, rating: 4.0, am: 'Free WiFi,Breakfast,Parking', desc: 'A budget-friendly inn offering clean, cosy rooms and quick service.' }
  ];

const base = hashStr(locKey + '-tripwithus-hotels');
  const imageOffset = base % NEW_HOTEL_IMAGES.length;
  const result = [];
  const use = Math.min(totalCount, templates.length);
  for (let i = 0; i < use; i++) {
    const t = templates[i];
    const basePrice = Math.round((t.rate * 1000) + (Math.random() * 400));
    const demand = randomDemandFactor();
    const currentPrice = Math.round(basePrice * demand / 100) * 100;
    const availRooms = Math.floor(t.rooms * (0.3 + Math.random() * 0.5));
    result.push({
      id: 5000 + (base % 9000) + i * 31,
      hotelName: cityTitle + ' ' + t.suffix,
      location: location,
      roomType: 'Deluxe',
      totalRooms: t.rooms,
      availableRooms: availRooms,
      basePrice: basePrice,
      currentPrice: currentPrice,
      rating: t.rating,
      description: t.desc,
      imageUrl: NEW_HOTEL_IMAGES[(imageOffset + i) % NEW_HOTEL_IMAGES.length],
      amenities: t.am
    });
  }
  return result;
}

/* Save original API functions */
var _apiGet = get;
var _apiPost = post;

/* Override get with mock interceptor */
get = async function(path) {
if (path.match(/^\/reviews\/public\/HOTEL\//)) {
    await sleep(60);
    return [
      { id: 1, user: { name: 'Rahul Sharma' }, rating: 5, comment: 'Amazing stay! Great amenities and friendly staff. Highly recommended.', helpfulCount: 12, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 2, user: { name: 'Priya Verma' }, rating: 4, comment: 'Lovely rooms and excellent location. Breakfast spread was good.', helpfulCount: 8, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
      { id: 3, user: { name: 'Arjun Nair' }, rating: 5, comment: 'Very comfortable and clean. The view from the room was beautiful!', helpfulCount: 5, createdAt: new Date(Date.now() - 86400000 * 12).toISOString() }
    ];
  }
if (path === '/profile') {
    // Try the real backend first so each user sees ONLY their own saved details.
    try {
      var realProfile = await _apiGet(path);
      if (realProfile && realProfile.id) return realProfile;
    } catch (e) { /* backend unavailable -> fall back to saved/local mock */ }
await sleep(50);
    return {
      id: parseInt(getUserId() || '1'),
      name: getUserName() || 'Travel User',
      mobileNumber: getUserMobile() || getUserId() || '9876543210',
      email: getUserEmail() || 'user@example.com',
      age: parseInt(getUserAge() || '28'),
      location: getUserLocation() || 'Delhi, India'
    };
  }
if (path.startsWith('/search/hotels')) {
    var url = new URL(path, window.location.origin);
    var location = url.searchParams.get('location') || 'Jaipur';
    var date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    // Always use the frontend location-aware catalog so every city shows its
    // own distinct hotels with unique names & images (user requirement).
    // (The backend previously returned the same seed hotels for every search.)
    await sleep(50);
    return generateMockHotels(location, date, 8);
  }
  if (path.startsWith('/search/buses')) {
    var url = new URL(path, window.location.origin);
    var from = url.searchParams.get('from') || 'Delhi';
    var to = url.searchParams.get('to') || 'Jaipur';
    var date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    await sleep(60);
    return generateMockBuses(from, to, date, 8);
  }
  if (path.startsWith('/search/cars')) {
    var url = new URL(path, window.location.origin);
    var from = url.searchParams.get('from') || 'Delhi';
    var to = url.searchParams.get('to') || 'Jaipur';
    var date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    await sleep(50);
    return generateMockCars(from, to, date, 8);
  }
  if (path.startsWith('/search/trains')) {
    var url = new URL(path, window.location.origin);
    var from = url.searchParams.get('from') || 'Delhi';
    var to = url.searchParams.get('to') || 'Jaipur';
    var date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    await sleep(70);
    return generateMockTrains(from, to, date, 8);
  }
if (path.startsWith('/bookings/my')) {
    await sleep(100);
    // Seed a few demo bookings on first load so History filter/reset has data.
    var saved = localStorage.getItem('twu_bookings');
    if (!saved) {
      var now = Date.now();
      saved = JSON.stringify([
        { id: 9001, bookingType: 'BUS', fromLocation: 'Mumbai', toLocation: 'Goa', travelDate: '2026-03-14', passengerDetails: JSON.stringify({ name: 'Aarav Shah' }), seatNumbers: 'B12', bookedAt: new Date(now - 86400000 * 2).toISOString(), status: 'CONFIRMED', baseAmount: 1200, discountAmount: 0, finalAmount: 1200 },
        { id: 9002, bookingType: 'FLIGHT', fromLocation: 'Delhi', toLocation: 'Bengaluru', travelDate: '2026-03-20', passengerDetails: JSON.stringify({ name: 'Meera Nair' }), seatNumbers: '14A', bookedAt: new Date(now - 86400000 * 5).toISOString(), status: 'CONFIRMED', baseAmount: 5400, discountAmount: 400, finalAmount: 5000 },
        { id: 9003, bookingType: 'HOTEL', fromLocation: 'Manali', toLocation: 'Manali', travelDate: '2026-04-02', passengerDetails: JSON.stringify({ name: 'Rohan Iyer' }), bookedAt: new Date(now - 86400000 * 9).toISOString(), status: 'CONFIRMED', baseAmount: 8200, discountAmount: 0, finalAmount: 8200 },
        { id: 9004, bookingType: 'TRAIN', fromLocation: 'Chennai', toLocation: 'Pondicherry', travelDate: '2026-02-28', passengerDetails: JSON.stringify({ name: 'Divya Krishnan' }), seatNumbers: 'S22', bookedAt: new Date(now - 86400000 * 12).toISOString(), status: 'CANCELLED', baseAmount: 900, discountAmount: 0, finalAmount: 900 }
      ]);
      localStorage.setItem('twu_bookings', saved);
    }
    return JSON.parse(saved);
  }
if (path.startsWith('/search/flights')) {
    var url = new URL(path, window.location.origin);
    var from = url.searchParams.get('from') || 'Delhi';
    var to = url.searchParams.get('to') || 'Jaipur';
    var date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    // Try the real backend first so admin-added flights appear in user search.
    try {
      var realFlights = await _apiGet(path);
      if (Array.isArray(realFlights) && realFlights.length) return realFlights;
    } catch (e) { /* backend unavailable -> fall back to mock */ }
    await sleep(40);
    return generateMockFlights(from, to, date, 8);
  }
if (path.match(/^\/buses\/\d+\/seats$/)) {
    await sleep(100);
    return generateMockSeats(40, Math.floor(Math.random() * 15), 'BUS');
  }
  return _apiGet(path);
};

/* ---------- Local mock users store ---------- */
function getMockUsers() {
  try { return JSON.parse(localStorage.getItem('twu_mock_users') || '[]'); }
  catch (e) { return []; }
}
function saveMockUser(u) {
  var users = getMockUsers();
  // Replace if same mobile already exists
  users = users.filter(function(x) { return x.mobileNumber !== u.mobileNumber; });
  users.push(u);
  localStorage.setItem('twu_mock_users', JSON.stringify(users));
}

/* Override post with mock interceptor */
post = async function(path, data) {
  /* UNIQUE: handle signup + login locally so account creation works even
     when the static frontend is served without an /api proxy (e.g. python
     http.server). Falls through to the real backend when available. */
  if (path === '/auth/signup') {
    var users = getMockUsers();
    var exists = users.find(function(u) { return u.mobileNumber === (data.mobileNumber || ''); });
    if (exists) {
      throw new Error('An account with this mobile number already exists');
    }
    if (!data.name || !data.password || !data.mobileNumber) {
      throw new Error('Name, mobile number and password are required');
    }
    var mId = 100 + users.length + 1;
    var mUser = {
      userId: mId,
      name: data.name,
      mobileNumber: data.mobileNumber,
      email: data.email || null,
      age: data.age != null ? data.age : null,
      location: data.location || null,
      role: 'USER',
      token: 'mock-token-' + mId + '-' + Date.now()
    };
    saveMockUser(mUser);
    await sleep(120);
    return mUser;
  }
  if (path === '/auth/login') {
    var q = (data.username || '').trim();
    var p = data.password || '';
    // Admin demo login
    if (q === 'joo' && p === 'joo@123') {
      await sleep(100);
      return { token: 'mock-admin-token-' + Date.now(), role: 'ADMIN', name: 'Administrator', userId: 0, mobileNumber: 'joo' };
    }
    // Try the real backend first so real users can still log in
    try {
      var realAuth = await _apiPost(path, data);
      if (realAuth && realAuth.token) return realAuth;
    } catch (e) { /* fall through to mock */ }
    // Match a locally created user by mobile number
    var match = getMockUsers().find(function(u) { return u.mobileNumber === q; });
    if (match) {
      await sleep(100);
      return match;
    }
    throw new Error('Invalid credentials');
  }
  if (path.startsWith('/bookings')) {
    // Handle cancellation: /bookings/{id}/cancel
    var cancelMatch = path.match(/^\/bookings\/(\d+)\/cancel$/);
    if (cancelMatch) {
      var cancelBookingId = parseInt(cancelMatch[1]);
      await sleep(150);
      var allBookings = JSON.parse(localStorage.getItem('twu_bookings') || '[]');
      allBookings = allBookings.map(function(b) {
        if (b.id === cancelBookingId) {
          b.status = 'CANCELLED';
          b.cancelledAt = new Date().toISOString();
          b.cancelReason = (data && data.reason) || 'Not specified';
        }
        return b;
      });
      localStorage.setItem('twu_bookings', JSON.stringify(allBookings));
      return { id: cancelBookingId, status: 'CANCELLED', refundInitiated: true };
    }
    // Mock booking creation
    var bookId = Date.now() + Math.floor(Math.random() * 1000);
    var booking = {
      id: bookId,
      bookingType: data.bookingType,
      referenceId: data.referenceId,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      travelDate: data.travelDate,
      seatNumbers: data.seatNumbers || null,
      passengerCount: data.passengerCount || 1,
      passengerDetails: data.passengerDetails || null,
      couponCode: data.couponCode || null,
      baseAmount: Math.floor(Math.random() * 3000 + 500),
      discountAmount: 0,
      finalAmount: Math.floor(Math.random() * 2500 + 500),
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString()
    };
    // Store in localStorage so profile page can retrieve it
    var existing = JSON.parse(localStorage.getItem('twu_bookings') || '[]');
    existing.unshift(booking);
    localStorage.setItem('twu_bookings', JSON.stringify(existing));
    await sleep(200);
    return booking;
  }
  if (path.match(/^\/flights\/live\/\d+\/refresh$/)) {
    await sleep(200);
    return { id: parseInt(path.match(/\d+/)[0]), status: 'On Time', updatedAt: new Date().toISOString() };
  }
  if (path.match(/^\/coupons\/validate\//)) {
    await sleep(50);
    var code = path.split('/').pop();
    var coupons = [
      { code: 'DIWALI25', discountPercent: 25, description: 'Festive Diwali offer' },
      { code: 'WELCOME10', discountPercent: 10, description: 'New user welcome discount' },
      { code: 'SUMMER15', discountPercent: 15, description: 'Summer travel special' },
      { code: 'NEWYEAR30', discountPercent: 30, description: 'New Year mega sale' }
    ];
    var coupon = coupons.find(function(c) { return c.code === code.toUpperCase(); });
    if (!coupon) throw new Error('Invalid or expired coupon');
    return coupon;
  }
  if (path.match(/^\/profile$/)) {
    await sleep(50);
    return { success: true, message: 'Profile updated' };
  }
  if (path === '/profile/issues') {
    await sleep(50);
    return { id: Date.now(), status: 'OPEN' };
  }
  if (path.match(/^\/reviews\/\d+\/flag$/)) {
    await sleep(100);
    return { flagged: true };
  }
  if (path.match(/^\/reviews\/\d+\/helpful$/)) {
    await sleep(100);
    return { helpfulCount: 1 };
  }
  if (path.match(/^\/reviews\/\d+\/reply$/)) {
    await sleep(100);
    return { id: Date.now(), comment: data.comment };
  }
  if (path.match(/^\/reviews$/)) {
    await sleep(100);
    return { id: Date.now(), status: 'submitted' };
  }
  if (path.match(/^\/recommendations\/\d+\/feedback$/)) {
    await sleep(50);
    return { feedback: data.feedback };
  }
  if (path === '/recommendations/generate' || path === '/recommendations/my') {
    await sleep(100);
    return [
      { id: 1, itemName: 'Goa Beach Resort', reasonText: 'You booked beach destinations before! Try Goa Beach Resort.', matchScore: 0.85 },
      { id: 2, itemName: 'Jaipur Heritage Hotel', reasonText: 'You booked heritage destinations before! Try Jaipur Heritage Hotel.', matchScore: 0.78 },
      { id: 3, itemName: 'Manali Hill Station', reasonText: 'You booked hill destinations before! Try Manali Hill Station.', matchScore: 0.72 }
    ];
  }
  return _apiPost(path, data);
};
