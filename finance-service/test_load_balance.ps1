$count8084 = 0
$count8085 = 0
$totalRequests = 100

Write-Host "Zapocinjem testiranje 100 zahtjeva sa Load Balancingom..." -ForegroundColor Cyan


$startTimeLB = Get-Date
for ($i=1; $i -le $totalRequests; $i++) {
    try {

        $response = Invoke-RestMethod -Uri "http://localhost:8084/api/test/lb-test"

        if ($response -match "8084") { $count8084++ }
        elseif ($response -match "8085") { $count8085++ }


        Write-Host "Zahtjev $($i) - $($response)"
    } catch {
        Write-Host "Zahtjev $($i) - Greška pri pozivu!" -ForegroundColor Red
    }
}
$endTimeLB = Get-Date
$durationLB = ($endTimeLB - $startTimeLB).TotalMilliseconds


Write-Host "`nSada mjerim vrijeme bez Load Balancinga..." -ForegroundColor Yellow
$startTimeDirect = Get-Date
for ($j=1; $j -le $totalRequests; $j++) {
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:8084/api/test/info"
    } catch {}
}
$endTimeDirect = Get-Date
$durationDirect = ($endTimeDirect - $startTimeDirect).TotalMilliseconds


Write-Host "`n================ REZULTATI ================" -ForegroundColor Green
Write-Host "Ukupno zahtjeva: $totalRequests"
Write-Host "Instanca na portu 8084 odgovorila: $count8084 puta"
Write-Host "Instanca na portu 8085 odgovorila: $count8085 puta"
Write-Host "-------------------------------------------"
Write-Host "Vrijeme SA Load Balancingom: $($durationLB) ms"
Write-Host "Vrijeme BEZ Load Balancinga: $($durationDirect) ms"
Write-Host "Razlika (overhead): $($durationLB - $durationDirect) ms"
Write-Host "===========================================" -ForegroundColor Green