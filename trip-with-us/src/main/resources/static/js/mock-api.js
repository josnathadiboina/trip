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

function formatTime12h(timeStr) {
  if (!timeStr) return '--:--';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h = h - 12;
  return h + ':' + m + ' ' + ampm;
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

/* ---------- Mock Hotels ---------- */
const HOTEL_NAMES = [
  { name: 'Grand Palace Hotel', rating: 4.6, rate: 4.0, rooms: 40 },
  { name: 'Lake View Resort', rating: 4.8, rate: 5.5, rooms: 25 },
  { name: 'City Inn Express', rating: 4.0, rate: 1.8, rooms: 50 },
  { name: 'The Royal Heritage', rating: 4.7, rate: 6.0, rooms: 20 },
  { name: 'Comfort Stay Lodge', rating: 4.2, rate: 2.2, rooms: 35 },
  { name: 'Skyline Boutique Hotel', rating: 4.5, rate: 3.5, rooms: 30 },
  { name: 'Sunrise Residency', rating: 4.1, rate: 2.0, rooms: 45 },
  { name: 'Elite Continental', rating: 4.4, rate: 4.5, rooms: 28 },
  { name: 'Green View Retreat', rating: 4.3, rate: 2.8, rooms: 32 },
  { name: 'Crystal Paradise Hotel', rating: 4.9, rate: 7.0, rooms: 15 },
];

function generateMockHotels(location, date, count) {
  const shuffled = [...HOTEL_NAMES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map((h, idx) => {
    const basePrice = Math.round((h.rate * 1000) + (Math.random() * 500));
    const demand = randomDemandFactor();
    const currentPrice = Math.round(basePrice * demand / 100) * 100;
    const availRooms = Math.floor(h.rooms * (0.3 + Math.random() * 0.5));
    const imgIdx = (idx % 10) + 1;
    return {
      id: 5000 + idx,
      hotelName: h.name + ', ' + location,
      location: location,
      roomType: 'Deluxe',
      totalRooms: h.rooms,
      availableRooms: availRooms,
      basePrice: basePrice,
      currentPrice: currentPrice,
      rating: h.rating,
      imageUrl: 'https://images.unsplash.com/photo-' + ['1566073771259-6a8506099945', '1571003123894-1f0594d2b5d9', '1551882547-ff40c63fe5fa', '1566665797739-1674de7a421a', '1611892440504-42a792e24d32', '1564501049412-61c2a3083791', '1562778612-e1e0cda9915c', '1578683010236-d716f9a3f461', '1584132967334-10e028bd69f7', '1568084680786-a84f91d1153c'][idx % 10] + '?w=500&q=80',
      amenities: 'Free WiFi,Parking,Breakfast,AC,Restaurant,Gym'.split(',').sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3)).join(',')
    };
  });
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
    // Try the real backend first so admin-added hotels appear in user search.
    try {
      var realHotels = await _apiGet(path);
      if (Array.isArray(realHotels) && realHotels.length) return realHotels;
    } catch (e) { /* backend unavailable -> fall back to mock */ }
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
    return JSON.parse(localStorage.getItem('twu_bookings') || '[]');
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
  if (path.match(/^\/trains\/\d+\/seats$/)) {
    await sleep(100);
    return generateMockSeats(72, Math.floor(Math.random() * 20), 'TRAIN');
  }
  if (path.match(/^\/flights\/\d+\/seats$/)) {
    await sleep(100);
    return generateMockSeats(180, Math.floor(Math.random() * 30), 'FLIGHT');
  }
  if (path === '/flights/tracked') {
    await sleep(50);
    var trackedFlights = JSON.parse(localStorage.getItem('twu_tracked_flights') || '[]');
    return trackedFlights;
  }
  if (path === '/pricing/freeze/active') {
    await sleep(50);
    return null; // no active freeze by default
  }
  if (path.startsWith('/pricing/history')) {
    await sleep(80);
    var url2 = new URL(path, window.location.origin);
    var type = url2.searchParams.get('type') || 'FLIGHT';
    var targetId = url2.searchParams.get('targetId') || '1';
    var mockPrices = [];
    var base = 1800;
    for (var i = 0; i < 6; i++) {
      base = Math.round((base + (Math.random() * 400 - 100)) / 10) * 10;
      mockPrices.push({ id: i + 1, targetType: type, targetId: parseInt(targetId), price: base, reason: 'Demand-based pricing', recordedAt: new Date(Date.now() - (5 - i) * 86400000).toISOString() });
    }
    return mockPrices;
  }
  return _apiGet(path);
};

/* Override post with mock interceptor */
post = async function(path, data) {
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
  if (path.match(/^\/flights\/tracked$/)) {
    await sleep(50);
    var trackedFlights = JSON.parse(localStorage.getItem('twu_tracked_flights') || '[]');
    return trackedFlights;
  }
  if (path.match(/^\/flights\/\d+\/track$/)) {
    await sleep(100);
    var fid = parseInt(path.match(/\d+/)[0]);
    var allTracked = JSON.parse(localStorage.getItem('twu_tracked_flights') || '[]');
    if (!allTracked.some(function(t) { return t.flightId === fid; })) {
      allTracked.push({ id: Date.now(), flightId: fid });
      localStorage.setItem('twu_tracked_flights', JSON.stringify(allTracked));
    }
    return { id: Date.now(), flightId: fid };
  }
  if (path === '/pricing/freeze/active') {
    await sleep(50);
    return null; // no active freeze by default
  }
  if (path === '/pricing/freeze') {
    await sleep(150);
    var expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    return {
      id: Date.now(),
      targetType: data.type,
      targetId: parseInt(data.targetId),
      frozenPrice: parseFloat(data.price),
      expiresAt: expiresAt,
      active: true
    };
  }
  if (path === '/pricing/history') {
    await sleep(80);
    var type = new URLSearchParams(path.split('?')[1]).get('type');
    var targetId = new URLSearchParams(path.split('?')[1]).get('targetId');
    var mockPrices = [];
    var base = 1800;
    for (var i = 0; i < 6; i++) {
      base = Math.round((base + (Math.random() * 400 - 100)) / 10) * 10;
      mockPrices.push({ id: i + 1, targetType: type, targetId: parseInt(targetId), price: base, reason: 'Demand-based pricing', recordedAt: new Date(Date.now() - (5 - i) * 86400000).toISOString() });
    }
    return mockPrices;
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
