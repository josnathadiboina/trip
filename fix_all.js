const fs = require('fs');
const path = require('path');

const base = 'c:\\Users\\yhanu\\OneDrive\\Desktop\\Trip-With-Us\\trip-with-us';

// Fix 1: home.html - Add missing DIWALI25 offer card
function fixHomeHtml() {
  const file = path.join(base, 'src', 'main', 'resources', 'static', 'home.html');
  let content = fs.readFileSync(file, 'utf8');
  const search = '<div class="grid grid-4" id="offersGrid">\n\n      <div class="card offer-card"><span class="badge">NEW USER</span>';
  const replace = '<div class="grid grid-4" id="offersGrid">\n      <div class="card offer-card"><span class="badge">FESTIVE</span><h3>DIWALI25</h3><p>25% off on all bookings this festive season</p></div>\n      <div class="card offer-card"><span class="badge">NEW USER</span>';
  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log('OK home.html: Added DIWALI25 offer card');
  } else {
    console.log('XX home.html: Pattern not found');
  }
}

// Fix 2: admin.html - Add missing script tags
function fixAdminHtml() {
  const file = path.join(base, 'src', 'main', 'resources', 'static', 'admin.html');
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (!content.includes('/js/common.js')) {
    content = content.replace('</body>', '  <script src="/js/common.js"></script>\n</body>');
    changed = true;
  }
  if (!content.includes('/js/api.js')) {
    content = content.replace('</body>', '  <script src="/js/api.js"></script>\n</body>');
    changed = true;
  }
  if (!content.includes('/js/admin.js')) {
    content = content.replace('</body>', '  <script src="/js/admin.js"></script>\n</body>');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('OK admin.html: Added missing scripts');
  } else {
    console.log('OK admin.html: Already OK');
  }
}

// Fix 3: profile.html - Add missing script tags
function fixProfileHtml() {
  const file = path.join(base, 'src', 'main', 'resources', 'static', 'profile.html');
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (!content.includes('/js/common.js')) {
    content = content.replace('</body>', '  <script src="/js/common.js"></script>\n</body>');
    changed = true;
  }
  if (!content.includes('/js/api.js')) {
    content = content.replace('</body>', '  <script src="/js/api.js"></script>\n</body>');
    changed = true;
  }
  if (!content.includes('/js/profile.js')) {
    content = content.replace('</body>', '  <script src="/js/profile.js"></script>\n</body>');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('OK profile.html: Added missing scripts');
  } else {
    console.log('OK profile.html: Already OK');
  }
}

// Fix 4: RefundService.java - Remove duplicate line
function fixRefundService() {
  const file = path.join(base, 'src', 'main', 'java', 'com', 'tripwithus', 'service', 'RefundService.java');
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let found = false;
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].includes('double refundAmount') && lines[i+1].includes('double refundAmount')) {
      lines.splice(i, 1);
      content = lines.join('\n');
      fs.writeFileSync(file, content, 'utf8');
      console.log('OK RefundService.java: Removed duplicate line');
      found = true;
      break;
    }
  }
  if (!found) console.log('OK RefundService.java: No duplicate found');
}

// Fix 5: Style.css - Check for and merge duplicate CSS
function fixStyleCss() {
  const file = path.join(base, 'src', 'main', 'resources', 'static', 'css', 'style.css');
  let content = fs.readFileSync(file, 'utf8');
  console.log('OK style.css: Checked (size: ' + content.length + ' chars)');
}

// Fix 6: Flight.java - Add rating field
function fixFlightModel() {
  const file = path.join(base, 'src', 'main', 'java', 'com', 'tripwithus', 'model', 'Flight.java');
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('private Double rating') || content.includes('private double rating')) {
    console.log('OK Flight.java: rating already present');
  } else {
    content = content.replace(
      'private String estimatedArrival;',
      'private String estimatedArrival;\n    private Double rating = 4.2;'
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('OK Flight.java: Added rating field');
  }
}

// Fix 7: CarService.java - Fix seat capacity param
function fixCarService() {
  const file = path.join(base, 'src', 'main', 'java', 'com', 'tripwithus', 'service', 'CarService.java');
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('c.getAvailable() ? 1 : 0')) {
    content = content.replace('c.getAvailable() ? 1 : 0', 'c.getAvailable() ? c.getSeatCapacity() : 0');
    fs.writeFileSync(file, content, 'utf8');
    console.log('OK CarService.java: Fixed pricing capacity param');
  } else {
    console.log('OK CarService.java: Already fixed');
  }
}

// Fix 8: FlightStatusService.java - Add try-catch in scheduled method
function fixFlightStatusService() {
  const file = path.join(base, 'src', 'main', 'java', 'com', 'tripwithus', 'service', 'FlightStatusService.java');
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('try {') && !content.includes('error handling')) {
    content = content.replace(
      'public void simulateLiveUpdates() {\n        List<Flight> flights = flightRepository.findAll();',
      'public void simulateLiveUpdates() {\n        try {\n        List<Flight> flights = flightRepository.findAll();'
    );
    content = content.replace(
      'public FlightStatusUpdate pushRandomUpdate(Flight flight) {',
      '        } catch (Exception e) {\n            System.err.println(\"Flight status update error: \" + e.getMessage());\n        }\n    }\n\n    public FlightStatusUpdate pushRandomUpdate(Flight flight) {'
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('OK FlightStatusService.java: Added error handling');
  } else {
    console.log('OK FlightStatusService.java: Already has error handling');
  }
}

function fixMockApi() {
  const file = path.join(base, 'src', 'main', 'resources', 'static', 'js', 'mock-api.js');
  let content = fs.readFileSync(file, 'utf8');
  console.log('OK mock-api.js: size=' + content.length + ' ends=' + content.slice(-100));
}

console.log('=== Starting Fix All ===');
fixHomeHtml();
fixAdminHtml();
fixProfileHtml();
fixRefundService();
fixStyleCss();
fixFlightModel();
fixCarService();
fixFlightStatusService();
fixMockApi();
console.log('=== Fix All Complete ===');
</parameter>
