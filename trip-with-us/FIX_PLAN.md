# FIX PLAN — Hotel "Book This Hotel Room" Button Not Working

## Information Gathered

### Frontend flow (hotel.html + hotel.js)
1. User searches hotels → `renderHotels()` populates `#hotelResults` and stores `currentHotels`.
2. User clicks a hotel card → `showHotelDetailById(idx)` → `showHotelDetail(hotel)`.
3. `showHotelDetail()`:
   - Sets `selectedHotel = hotel`
   - Renders detail into `#hotelDetailContent` including the **"Book This Hotel Room"** button with `onclick="proceedFromHotelDetail()"`.
   - Calls `loadHotelReviews()` (async) and `injectHotelBubbles()`.
4. Clicking the button → `proceedFromHotelDetail()` should hide `hotelDetailSection` and show `roomSection`.

### Data model
- Backend `Hotel` entity has: `id, hotelName, location, roomType, totalRooms, availableRooms, basePrice, currentPrice, rating, imageUrl, amenities`. (`basePrice` IS present in data.sql.)
- Mock `generateMockHotels()` also returns `basePrice`.

### CSS
- `.hidden { display: none !important; }` — used to toggle sections.
- `.hotel-book-bar` has 3D hover transform.
- `.hotel-detail-floaties` (`#hotelBubbles`) is injected into `.hotel-detail-hero` with `pointer-events:none; z-index:0`.

## Root Cause

The **"Book This Hotel Room"** button's inline `onclick="proceedFromHotelDetail()"` is defined in `hotel.js`. The function logic is correct syntactically. However, the booking flow breaks because:

1. **Wrong target step** — After clicking the button, the code currently navigates to the room-selection (`roomSection`) step. The user expects the button to go **directly to the guest details section**, then to payment.

2. **Missing defensive guards** — `proceedFromHotelDetail()` assumes `selectedHotel.basePrice` and `selectedHotel.availableRooms` exist. If the hotel data lacks these (e.g., from a different source), `renderRoomTypes()` produces NaN prices and the flow appears broken.

## Desired Flow (per user)
Click **"Book This Hotel Room"** → go directly to **Guest Details** section (`passengerSection`) → user fills details → **Proceed to Payment** (`paymentSection`). Room-selection step is skipped; a default room is derived from the hotel's `roomType` and price.

## Plan of Edits

### 1. `hotel.js` — Redirect the button to Guest Details → Payment
- **Rewrite `proceedFromHotelDetail()`** so that clicking **"Book This Hotel Room"**:
  1. Hides `hotelDetailSection`.
  2. Shows **`passengerSection`** (Guest Details) directly.
  3. Sets a default `selectedRoom` derived from the hotel's `roomType`/`basePrice` (so summary/pricing work).
  4. Calls `refreshSummary()` and `generateCaptcha()`.
  5. Calls `updateSteps('passenger')`.
- **Harden** with `try/catch` and fallback values for `basePrice`/`availableRooms`.
- Ensure `proceedToPayment()` (existing) then moves to `paymentSection` → `confirmHotelBooking()`.

### 2. `hotel.html` — No structural change needed
- Sections already toggle via `.hidden`. The flow now targets `passengerSection` instead of `roomSection`. No HTML edits required.

## Dependent Files to be Edited
- `trip-with-us/src/main/resources/static/js/hotel.js`

## Follow-up Steps
- Rebuild/serve static files.
- Manually test: search hotels → open detail → click **Book This Hotel Room** → Guest Details section appears → fill details → **Proceed to Payment**.
- Verify no console errors.
