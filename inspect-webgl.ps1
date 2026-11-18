
$Project = Get-Location

$Files = @(
    "templates/index.html",
    "static/js/scene4-libra.js",
    "static/js/scene3.js",
    "static/js/ui-controller.js"
)

foreach ($File in $Files) {

    $Path = Join-Path $Project $File

    if (!(Test-Path $Path)) {
        Write-Host "`n[NOT FOUND] $File" -ForegroundColor Red
        continue
    }

    Write-Host "`n====================================" -ForegroundColor Cyan
    Write-Host "FILE: $File" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan

    $Lines = Get-Content $Path

    for ($i = 0; $i -lt $Lines.Count; $i++) {

        $Line = $Lines[$i]

        if (
            $Line -match "canvas|getContext|WebGLRenderer|initScene4|stopLibraScene|startLibraScene|dispose|knight3DCanvas|universe|requestAnimationFrame"
        ) {

            $Start = [Math]::Max(0, $i - 3)
            $End = [Math]::Min($Lines.Count - 1, $i + 5)

            Write-Host "`n--- Lines $($Start + 1)-$($End + 1) ---" -ForegroundColor Yellow

            for ($j = $Start; $j -le $End; $j++) {
                Write-Host ("{0,4}: {1}" -f ($j + 1), $Lines[$j])
            }
        }
    }
}

Write-Host "`nInspection completed." -ForegroundColor Green
