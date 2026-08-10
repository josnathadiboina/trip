$path = "c:\Users\yhanu\OneDrive\Desktop\Trip-With-Us\trip-with-us\src\main\resources\static\css\style.css"
$content = Get-Content $path -Raw
$idx = $content.LastIndexOf("z-index: 0;")
$newContent = $content.Substring(0, $idx + 12)
$newContent += "`n}"
$newContent += "`n`n.payment-spinner {"
$newContent += "`n  display: flex; align-items: center; justify-content: center; gap: 12px;"
$newContent += "`n  padding: 20px;"
$newContent += "`n}"
$newContent += "`n.spinner-3d {"
$newContent += "`n  width: 40px; height: 40px; border-radius: 50%;"
$newContent += "`n  border: 4px solid var(--border); border-top-color: var(--coral);"
$newContent += "`n  animation: spin3d 1s linear infinite; transform-style: preserve-3d;"
$newContent += "`n}"
$newContent += "`n@keyframes spin3d {"
$newContent += "`n  from { transform: rotateY(0deg) rotateZ(0deg); }"
$newContent += "`n  to { transform: rotateY(360deg) rotateZ(360deg); }"
$newContent += "`n}"
Set-Content $path $newContent
Write-Host "CSS file fixed successfully!"
