# Metorbike Racing Club

Ein 3D-Arcade-Rennspiel, inspiriert von den handgefertigten Café-Racern von [Metorbike Hamburg](https://metorbike.de/).

- Zwei eigene Strecken: **Kartbahn** bei Tageslicht und **Sternenallee**, eine leuchtende Regenbogenstrecke im All.
- Drei Runden gegen fünf Computerfahrer, Positionen, Minimap, Rundenzeiten und persönliche Streckenrekorde.
- Vier Lackierungen für das prozedural modellierte Café-Racer-Motorrad.
- Aufladbarer Boost, Boost-Felder, Kollisionen, Grasverzögerung und Leitplanken.
- Pause, Neustart, Garage, Vollbild und optionaler synthetischer Motorsound.
- Persönliche Bestzeiten und Einstellungen bleiben lokal im Browser gespeichert.

## Starten

Voraussetzung: Node.js 18 oder neuer. Keine Installation und kein Build erforderlich.

```sh
node server.mjs
```

Öffne **http://localhost:4173**. Für ein Handy im selben WLAN: `http://<IP-des-PCs>:4173` öffnen (ggf. lokalen Netzwerkzugriff für Node erlauben). Alternativ `dist/` über einen statischen Webhost veröffentlichen. ES-Module benötigen HTTP; `index.html` nicht per Doppelklick öffnen.

## Steuerung

| Aktion | PC | Smartphone im Querformat |
| --- | --- | --- |
| Gas | W / Pfeil hoch | Rechte Gas-Taste halten |
| Bremse | S / Pfeil runter | Rechte Brems-Taste |
| Lenken | A / D, Pfeile links / rechts | Linkes Lenkpad horizontal ziehen |
| Boost | Shift / Leertaste | Rechte Boost-Taste (gibt auch Gas) |
| Zurück auf die Strecke | R | Leitplanken halten dich auf der Strecke |
| Pause | Esc / P | Pause oben rechts |

Kurven haben eine leichte Fliehkraft. Vor engen Kurven bremsen und gegenlenken. Boost lädt sich von selbst wieder auf. Gelbe Felder aktivieren einen kurzen Boost und laden Energie nach. Beim Verlassen des Fensters pausiert das Rennen automatisch. Im Hochformat fordert das Spiel zum Drehen auf.

## Projekt

`dist/index.html`, `style.css`: Garage und responsive Spieloberfläche. `game.js`: Eingabe, Kamera, WebAudio und UI. `world.js`: Motorradmodelle, Strecken und Umgebung in Three.js. `race-core.mjs`: unabhängige Rennsimulation. `tests/`: Tests für die Rennregeln. `server.mjs`: lokaler statischer Server.

```sh
node --test tests/*.test.mjs
node --check dist/game.js
node --check dist/world.js
```

Three.js 0.170.0 ist lokal unter `dist/assets/` enthalten und steht unter der MIT-Lizenz (siehe `THIRD_PARTY_NOTICES.md`). Schriftarten werden optional von Google Fonts geladen, mit Systemschriften als Fallback. Das Spiel benötigt weder Account noch Backend.

Eigenständiges Fanprojekt, keine offizielle Metorbike- oder Nintendo-Veröffentlichung. Die Sternenallee ist eine eigene Strecke; keine Mario-Kart-Figuren, Musik oder Spieldateien werden verwendet. Die Bike-Lackierungen unterscheiden sich optisch; die Spielwerte sind identisch und keine realen Fahrzeugdaten.
