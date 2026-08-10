const fs = require('fs');
const base = 'c:\\Users\\yhanu\\OneDrive\\Desktop\\Trip-With-Us\\trip-with-us';

// Fix 1: home.html - add DIWALI25 card
function fixHomeHtml() {
  const file = base + '\\src\\main\\resources\\static\\home.html';
  let c = fs.readFileSync(file, 'utf8');
  const old = '<div class="grid grid-4" id="offersGrid">\n\n      <div class="card offer-card"><span class="badge">NEW USER</span>';
  const nw = '<div class="grid grid-4" id="offersGrid">\n      <div class="card offer-card"><span class="badge">FESTIVE</span><h3>DIWALI25</h3><p>25% off on all bookings this festive season</p></div>\n      <div class="card offer-card"><span class="badge">NEW USER</span>';
  if (c.includes(old)) {
    c = c.replace(old, nw);
    fs.writeFileSync(file, c, 'utf8');
    console.log('OK home.html: Added DIWALI25');
  } else if (!c.includes('DIWALI25')) {
    // Try with the already partially-edited version
    const old2 = '<div class="grid grid-4" id="offersGrid">\n\n      <div class="card offer-card"><span class="badge">NEW USER</span>';
    if (c.includes(old2)) {
      c = c.replace(old2, nw);
      fs.writeFileSync(file, c, 'utf8');
      console.log('OK home.html: Added DIWALI25 (alt)');
    } else {
      console.log('XX home.html: Pattern not found');
    }
  } else {
    console.log('OK home.html: Already has DIWALI25');
  }
}

// Fix 2: Check admin.html has common.js
function fixAdminHtml() {
  const file = base + '\\src\\main\\resources\\static\\admin.html';
  let c = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (!c.includes('/js/common.js')) { c = c.replace('</body>', '  <script src="/js/common.js"></script>\n</body>'); changed = true; }
  if (!c.includes('/js/api.js')) { c = c.replace('</body>', '  <script src="/js/api.js"></script>\n</body>'); changed = true; }
  if (changed) { fs.writeFileSync(file, c, 'utf8'); console.log('OK admin.html: Fixed'); }
  else { console.log('OK admin.html: Already ok'); }
}

// Fix 3: Check profile.html has api.js
function fixProfileHtml() {
  const file = base + '\\src\\main\\resources\\static\\profile.html';
  let c = fs.readFileSync(file, 'utf8');
  // Already has all scripts - verify
  if (c.includes('/js/api.js') && c.includes('/js/common.js') && c.includes('/js/profile.js')) {
    console.log('OK profile.html: All scripts present');
  } else {
    console.log('XX profile.html: Missing scripts');
  }
}

// Fix 4: Check RefundService - no duplicate line
function fixRefundService() {
  const file = base + '\\src\\main\\java\\com\\tripwithus\\service\\RefundService.java';
  let c = fs.readFileSync(file, 'utf8');
  const lines = c.split('\n');
  let found = false;
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].includes('double refundAmount') && lines[i+1].includes('double refundAmount')) {
      lines.splice(i, 1);
      c = lines.join('\n');
      fs.writeFileSync(file, c, 'utf8');
      console.log('OK RefundService.java: Removed duplicate');
      found = true;
      break;
    }
  }
  if (!found) console.log('OK RefundService.java: No duplicate');
}

// Fix 5: Update TODO.md
function updateTodo() {
  const file = base + '\\TODO.md';
  let c = fs.readFileSync(file, 'utf8');
  console.log('OK TODO.md: Read (' + c.length + ' chars)');
}

// Run all
console.log('=== Fixing remaining issues ===');
fixHomeHtml();
fixAdminHtml();
fixProfileHtml();
fixRefundService();
updateTodo();
console.log('=== Done ===');
</parameter>
