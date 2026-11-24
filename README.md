# Metorbike Racing Club

Ein 3D-Arcade-Rennspiel, inspiriert von den handgefertigten Café-Racern von [Metorbike Hamburg](https://metorbike.de/).

- Zwei eigene Strecken: **Kartbahn** bei Tageslicht und **Sternenallee**, eine leuchtende Regenbogenstrecke im All.
- Drei Runden gegen fünf Computerfahrer, Positionen, Minimap, Rundenzeiten und persönliche Streckenrekorde.
- Detailliertes eigenes Café-Racer-Modell mit offenem U-Rahmen, tiefem Motor, Speichenrädern, gebohrten Bremsscheiben, Lederstruktur und reflektierendem Lack.
- Vier Lackierungen und eine drehbare 360°-Ansicht per Ziehen, Pfeiltasten, Regler und Drehtasten.
- **2-kW- und 4-kW-Klasse** mit unterschiedlicher Arcade-Leistung und getrennten Streckenrekorden; die Computerfahrer fahren in derselben Klasse.
- **Einzel-, Höcker- oder Doppelsitz**, Leder in Dunkelbraun, Cognac oder Schwarz, optionaler Beifahrer. Ein Beifahrer aktiviert automatisch den Doppelsitz.
- Aufladbarer Boost, Boost-Felder, Kollisionen und Grasverzögerung.
- Bis ca. 54° Schräglage, **Wheelie beim Boost**, **Stoppie bei Vollbremsung** aus höherem Tempo. Beide Stunts drehen das Motorrad um den Radaufstandspunkt.
- Auf der **Sternenallee kann man herunterfallen**. Ein animierter Papagei hebt Bike und Fahrer wieder auf die Strecke, krächzt „Haha, du Lappen!“ und hinterlässt einen kleinen Fleck auf dem Fahrerhelm. Das Rennen läuft während der Bergung weiter; die Bergung überspringt keine Streckenteile.
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
| Zurück auf die Strecke | R, außerhalb einer laufenden Bergung | Papagei rettet dich nach einem Sturz automatisch |
| Pause | Esc / P | Pause oben rechts |

Kurven haben eine leichte Fliehkraft. Vor engen Kurven bremsen und gegenlenken. Boost lädt sich von selbst wieder auf. Gelbe Felder aktivieren einen kurzen Boost und laden Energie nach. Beim Verlassen des Fensters pausiert das Rennen automatisch. Im Hochformat fordert das Spiel zum Drehen auf. Papageien-Spruch und Motor lassen sich über den Tonknopf stummschalten; die Textblase bleibt sichtbar. Die Stimme nutzt die deutsche Sprachausgabe des Browsers, wenn verfügbar, ergänzt durch einen synthetischen Krächzer. Ein Helmfleck bleibt bis zum nächsten Rennen bestehen.

## Projekt

`dist/index.html`, `style.css`, `upgrade.css`: Garage und responsive Spieloberfläche. `game.js`: Eingabe, Kamera, Audio, Rettungsablauf und UI. `bike.js`: eigenes Motorradmodell, Sitzbänke, Fahrer, Beifahrer, Stunts, Materialien und Papagei. `bike-config.mjs`: Konfiguration und Leistungsklassen. `world.js`: Strecken und Umgebung in Three.js. `race-core.mjs`: unabhängige Rennsimulation einschließlich Stunts und Bergung. `tests/`: Tests für Rennregeln, beide Strecken, Klassen, Radaufstandspunkte und Rettung. `server.mjs`: lokaler statischer Server.

```sh
node --test tests/*.test.mjs
node --check dist/game.js
node --check dist/world.js
```

Three.js 0.170.0 ist lokal unter `dist/assets/` enthalten und steht unter der MIT-Lizenz (siehe `THIRD_PARTY_NOTICES.md`). Schriftarten werden optional von Google Fonts geladen, mit Systemschriften als Fallback. Das Spiel benötigt weder Account noch Backend.

Eigenständiges Fanprojekt, keine offizielle Metorbike- oder Nintendo-Veröffentlichung. Die Sternenallee ist eine eigene Strecke; keine Mario-Kart-Figuren, Musik oder Spieldateien werden verwendet. Die Bike-Lackierungen unterscheiden sich optisch; die Spielwerte sind identisch und keine realen Fahrzeugdaten.
