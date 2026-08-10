# Cleanup Task — Remove Unwanted/Dead Code

## Steps
- [x] Analyze project structure and identify dead code
- [x] Get user approval on the cleanup plan
- [x] Delete `backend/src/main/java/com/tripwithus/config/ApiResponse.java` (duplicate dead class)
- [x] Delete `backend/src/main/java/com/tripwithus/dto/SearchRequest.java` (unused DTO)
- [x] Edit `frontend/js/mock-api.js`:
  - [x] Remove unused `formatTime12h()` (duplicate of common.js helper)
  - [x] Remove unused `GET /trains/{id}/seats` mock interceptor
  - [x] Remove unused `GET /flights/{id}/seats` mock interceptor
- [x] Verify backend still compiles (`mvn compile`)

## Follow-up
- [ ] Manual browser smoke-test of bus/train/flight search flows
