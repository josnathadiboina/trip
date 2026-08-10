$path = 'c:\Users\yhanu\OneDrive\Desktop\Trip-With-Us\trip-with-us\src\main\resources\static\home.html'
$text = [System.IO.File]::ReadAllText($path)
$old = '<div class="grid grid-4" id="offersGrid">

      <div class="card offer-card"><span class="badge">NEW USER</span>'
$new = '<div class="grid grid-4" id="offersGrid">
      <div class="card offer-card"><span class="badge">FESTIVE</span><h3>DIWALI25</h3><p>25% off on all bookings this festive season</p></div>
      <div class="card offer-card"><span class="badge">NEW USER</span>'
$text = $text.Replace($old, $new)
[System.IO.File]::WriteAllText($path, $text, [System.Text.Encoding]::UTF8)
Write-Host "Home.html fixed successfully"</｜｜DSML｜｜parameter>
