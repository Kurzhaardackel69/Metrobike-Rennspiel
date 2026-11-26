# Spielt den Stand von GitHub (origin/main) als Spiel auf rennen.metorbike.de ein (Hetzner-Server des Intranets, /srv/rennspiel).
# Ablauf: pruefen -> einpacken -> hochladen -> Image bauen (inkl. Tests) -> erst dann den laufenden Container ersetzen.
# Scheitern Tests oder Build, laeuft die alte Fassung weiter. Laufende Rennen gehen beim Wechsel verloren.
# Braucht den SSH-Schluessel im ssh-agent (siehe SERVER.md im ERP-Repository) und das Netzwerk "rennspiel" der ERP-Seite.
# Aufruf: powershell -NoProfile -ExecutionPolicy Bypass -File scripts\server-update.ps1
$ErrorActionPreference = "Stop"
$Server = "metorbike"
$Url = "https://rennen.metorbike.de/health"
$Ssh = @("-o", "BatchMode=yes", "-o", "ConnectTimeout=15")
$Compose = "COMPOSE_FILE=docker-compose.yml:docker-compose.server.yml docker compose"

function Stop-Update([string]$Grund) {
    Write-Host "ABGEBROCHEN: $Grund"
    exit 1
}

Set-Location (Join-Path $PSScriptRoot "..")

# 1. Nur das einspielen, was auf GitHub steht
if (git status --porcelain) { Stop-Update "Es gibt ungespeicherte Aenderungen (git status). Erst committen oder klaeren." }
git fetch --quiet origin
if ($LASTEXITCODE -ne 0) { Stop-Update "GitHub nicht erreichbar (git fetch)." }
$Head = (git rev-parse HEAD).Trim()
$Main = (git rev-parse origin/main).Trim()
if ($Head -ne $Main) { Stop-Update "Lokaler Stand ($($Head.Substring(0,7))) ist nicht der Stand auf GitHub ($($Main.Substring(0,7))). Erst git pull bzw. git push." }
$Stand = (git log -1 --format="%h %s").Trim()
Write-Host "Stand: $Stand"

ssh @Ssh $Server "docker network inspect rennspiel >/dev/null"
if ($LASTEXITCODE -ne 0) { Stop-Update "Keine SSH-Verbindung ohne Eingabe oder Netzwerk 'rennspiel' fehlt (erst ERP-Update mit Spiel-Eintrag einspielen)." }

# 2. Einpacken und hochladen (Android, Desktop und Downloads braucht der Server nicht)
Write-Host "1/3 Einpacken und hochladen ..."
$Tar = Join-Path $env:TEMP "rennspiel.tar"
git archive --format=tar -o $Tar HEAD Dockerfile .dockerignore docker-compose.yml docker-compose.server.yml package.json dist multiplayer tests
if ($LASTEXITCODE -ne 0) { Stop-Update "Einpacken fehlgeschlagen." }
scp @Ssh $Tar "${Server}:/root/rennspiel.tar"
$Hochgeladen = $LASTEXITCODE -eq 0
Remove-Item $Tar -ErrorAction SilentlyContinue
if (-not $Hochgeladen) { Stop-Update "Hochladen fehlgeschlagen, nichts eingespielt." }

# 3. In neuem Ordner bauen; nur wenn das klappt, Ordner tauschen und Container ersetzen
Write-Host "2/3 Bauen und testen (dauert etwas) ..."
ssh @Ssh $Server "rm -rf /srv/rennspiel.neu && mkdir -p /srv/rennspiel.neu && tar -xf /root/rennspiel.tar -C /srv/rennspiel.neu --exclude=dist/downloads && rm /root/rennspiel.tar && cd /srv/rennspiel.neu && $Compose build && rm -rf /srv/rennspiel && mv /srv/rennspiel.neu /srv/rennspiel && cd /srv/rennspiel && $Compose up -d && docker image prune -f >/dev/null"
if ($LASTEXITCODE -ne 0) { Stop-Update "Bauen oder Tests fehlgeschlagen, die alte Fassung laeuft weiter." }

# 4. Antwortet das Spiel?
Write-Host "3/3 Spiel pruefen ..."
$Ok = $false
for ($i = 0; $i -lt 12 -and -not $Ok; $i++) {
    Start-Sleep -Seconds 5
    try { $Ok = (Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10).StatusCode -eq 200 } catch { }
}
ssh @Ssh $Server "cd /srv/rennspiel && $Compose logs --tail 10"
if (-not $Ok) { Stop-Update "rennen.metorbike.de antwortet nach 60 s nicht. DNS-Eintrag und Caddy-Logs des Intranets pruefen." }
Write-Host "FERTIG: $Stand laeuft auf rennen.metorbike.de."
