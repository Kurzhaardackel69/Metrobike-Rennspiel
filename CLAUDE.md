# Übergabe für Claude · Metorbike Racing Club

Stand 26. November 2026. Das Repository [Kurzhaardackel69/Metrobike-Rennspiel](https://github.com/Kurzhaardackel69/Metrobike-Rennspiel) ist die Quelle für den Code. Entwickelt wird auf `main`. Der aktuelle Spielstand ist **1.7.0**, Multiplayer-Protokoll **3**. [README.md](README.md) beschreibt Spiel und Builds. [HOSTING.md](HOSTING.md) beschreibt das geplante Hetzner-Hosting.

## Spiel und Architektur

| Bereich | Einstieg |
| --- | --- |
| Browser und 3D-Einzelspieler | `dist/index.html`, `dist/game.js`, `dist/race-core.mjs`, `dist/world.js` |
| 2D-Multiplayer für 2–5 Spieler | `dist/mx-client.mjs`, `dist/mx-physics.mjs`, `dist/mx-motion.mjs`, `dist/mx-terrain.mjs` |
| Website und WebSocket-Rennserver | `multiplayer/server.mjs` mit `ws`, Endpunkte `/health` und `/ws` |
| Windows-App | `desktop/main.mjs`, `scripts/build-windows.mjs`, Workflow `windows-app.yml` |
| Android-App | `android/`, `scripts/prepare-android.mjs`, Workflow `android-apk.yml` |

Die Browserdateien liegen direkt in `dist/`. Der Multiplayer-Server bestimmt Positionen, Treffer und Ergebnisse. Der Client sagt die Bewegung des eigenen Bikes voraus, gleicht sie mit dem Server ab und zeichnet Gegner zwischen empfangenen Rennständen. Kamera und eigenes Bike nutzen dieselbe gerenderte Position. Jeder Spieler sieht das eigene Bike auf der vorderen Bahn.

Im Einzelspieler funktionieren Name, 1–10 Runden und Locker/Normal/Profi. Die mobile Steuerung im Querformat nutzt links Gas, Bremse und Lenkung, rechts Feuer und Hupe. Spotify öffnet gespeicherte Links extern. Die Spielsteuerung, das Clubradio und die getrennten Lautstärkeregler bleiben Teil des Spiels.

## Lokal starten und prüfen

Node.js ab Version 22 und npm verwenden.

```sh
npm ci --prefix multiplayer
npm run check
npm test
node multiplayer/server.mjs --lan
```

Auf dem Gastgeber `http://127.0.0.1:8787` öffnen. Andere Geräte öffnen die vom Server ausgegebene LAN-Adresse oder tragen im Windows-Client die WebSocket-Adresse des Gastgebers ein. Unter **2D MX** erstellt einer den Raum. Die übrigen treten mit dem Raumcode bei. Alle müssen dieselbe Protokollversion verwenden.

Version 1.7 bestand 62 automatisierte Tests, Browserprüfungen für sechs Displaygrößen und einen Windows-Test mit fünf verbundenen Teilnehmern. Die Windows-Messung auf dem Software-Prüfrechner ergab rund 14 FPS bei rund 20 Serverständen pro Sekunde. Die Bildrate auf den PCs der Spieler ist offen. Für weitere Diagnose die FPS- und Ping-Anzeige auf beiden PCs vergleichen. Der lokale Mehrspielerzugang funktionierte über einen gemeinsamen Handy-Hotspot. Im Gast-WLAN erreichten sich die Geräte nicht.

## Hetzner · aktueller Blocker

Die bestätigte Serveradresse antwortet über SSH. Der Versuch mit `root` und dem vorhandenen lokalen Schlüssel wurde mit `Permission denied (publickey)` abgewiesen. Der Serverinhaber meldet sich von seinem PC mit seinem eigenen SSH-Schlüssel an. Er kann den öffentlichen Schlüssel des Projektadmins für einen vereinbarten Linux-Benutzer hinterlegen und den Benutzernamen mitteilen. Ein Passwortreset ist für diesen Weg nicht nötig. Auf dem Windows-PC heißt die vorhandene öffentliche Schlüsseldatei `metorbike.pub`; das lokale SSH-Profil heißt `metorbike`. Zugangsdaten und private Schlüssel bleiben außerhalb des Repositorys.

Sobald der Inhaber den Zugang freigeschaltet hat, SSH testen und Betriebssystem, laufende Dienste sowie belegte Ports prüfen. Anschließend Website und Rennserver gemeinsam bereitstellen. Für die spätere Spieladresse eine Domain oder Subdomain mit dem Projektteam auswählen, DNS zuordnen und HTTPS sowie WSS auf derselben Domain einrichten. Danach Website, Raumbeitritt und ein Rennen mit zwei Geräten testen.

Ziel ist eine feste Spieladresse mit **genau einer öffentlich erreichbaren, aktuellsten erfolgreich geprüften Fassung aus GitHub `main`**. Der Server soll Updates automatisch beziehen und fehlerhafte Builds vor dem Wechsel abfangen. GitHub behält die Änderungshistorie. Bei der Update-Strategie berücksichtigen, dass laufende Räume derzeit im Arbeitsspeicher liegen und durch einen Neustart verloren gehen.

**Stand der Umsetzung:** SSH-Freischaltung, Hetzner-Deployment, Domain, HTTPS und automatische Updates stehen aus. Die bisherige Browser- und LAN-Version kann weiterhin getestet werden.
