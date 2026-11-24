# Metorbike Racing Club

Ein 3D-Arcade-Rennspiel, inspiriert von den handgefertigten Café-Racern von [Metorbike Hamburg](https://metorbike.de/).

- Zwei eigene Strecken: **Kartbahn** bei Tageslicht und **Sternenallee**, eine leuchtende Regenbogenstrecke im All.
- **Spielername, 1–10 Runden und drei Schwierigkeiten** (Locker / Normal / Profi). Fünf Computerfahrer, Positionen, Minimap und persönliche Bestzeiten getrennt nach Strecke, Leistungsklasse, Rundenzahl und Schwierigkeit.
- Detailliertes eigenes Café-Racer-Modell mit offenem U-Rahmen, tiefem Motor, Speichenrädern, gebohrten Bremsscheiben, Lederstruktur und reflektierendem Lack.
- Vier Lackierungen und eine drehbare 360°-Ansicht per Ziehen, Pfeiltasten, Regler und Drehtasten.
- **2-kW- und 4-kW-Klasse** mit unterschiedlicher Arcade-Leistung und getrennten Streckenrekorden; die Computerfahrer fahren in derselben Klasse.
- **Einzel-, Höcker- oder Doppelsitz**, Leder in Dunkelbraun, Cognac oder Schwarz, optionaler Beifahrer. Ein Beifahrer aktiviert automatisch den Doppelsitz.
- **Stummellenker oder hoher Lenker**, mit dazu passender Handposition des Fahrers. Kürzerer Tank mit Freiraum zur Gabel und kompakte Schutzbleche.
- Geschwindigkeitsabhängiges, weiches Einlenken mit seitlicher Trägheit, begrenztem Grip, Schräglage und Lastwechseln beim Bremsen und Beschleunigen.
- Aufladbarer Boost, Boost-Felder, Kollisionen und Grasverzögerung.
- Bis ca. 54° Schräglage, **Wheelie beim Boost**, **Stoppie bei Vollbremsung** aus höherem Tempo. Beide Stunts drehen das Motorrad um den Radaufstandspunkt.
- Auf der **Sternenallee kann man herunterfallen**. Ein animierter Papagei hebt Bike und Fahrer wieder auf die Strecke. Eine Nahaufnahme zeigt einen großen Haufen sichtbar vom Vogel auf den Fahrerhelm fallen. Er bleibt nach der Landung auf dem Helm. Das Rennen läuft während der Bergung weiter; die Bergung überspringt keine Streckenteile.
- Der Papagei wird mit jedem Absturz im Rennen frecher. Unter **🦜 Papagei** lassen sich eigene Sprüche (eine Zeile pro Absturz, bis zu 12 Zeilen), Platzhalter `{name}` / `{sturz}` und zwei krächzende Stimmen konfigurieren und anhören. Die letzte Zeile wird bei weiteren Stürzen wiederholt. Alle Texte und Einstellungen bleiben im Browser gespeichert.
- Eine als Frau gestaltete Beifahrerin mit Gesicht, Pferdeschwanz und Motorradkleidung reagiert auf Wheelies und Stoppies: kurze Schlaganimation gegen den Fahrer und „Lass den Scheiß!“. Die Animation beeinflusst das Fahrverhalten nicht.
- Blubbernder **V2-Sound** mit ungleichmäßigen Zündimpulsen und drehzahlabhängigem Auspuffklang. Motor und Sprache sind stummschaltbar; der Motor wird während der Sprüche leiser.
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
| Gas | W | Rechte Gas-Taste halten |
| Bremse | S | Rechte Brems-Taste |
| Lenken | A / D | Linkes Lenkpad horizontal ziehen |
| Kamera nur solange gehalten | ← / → Seite, ↑ von oben, ↓ von vorne | Rennkamera |
| Boost | Shift / Leertaste | Rechte Boost-Taste (gibt auch Gas) |
| Zurück auf die Strecke | R, außerhalb einer laufenden Bergung | Papagei rettet dich nach einem Sturz automatisch |
| Pause | Esc / P | Pause oben rechts |

Vor engen Kurven bremsen und ruhig einlenken: abrupte Richtungswechsel bei hohem Tempo benötigen Zeit. Boost lädt sich von selbst wieder auf. Gelbe Felder aktivieren einen kurzen Boost und laden Energie nach. Beim Verlassen des Fensters pausiert das Rennen automatisch. Im Hochformat fordert das Spiel zum Drehen auf. Pfeiltasten verändern ausschließlich die Kamera; nach dem Loslassen kehrt sie zur Rennansicht zurück. Die Papageienstimme wird lokal mit meSpeak / eSpeak, Croak-Variante, Bandpass, Verzerrung und Tremolo erzeugt. Eine Gerätestimme dient als Ausweichlösung. Die Beifahrerin verwendet bevorzugt eine verfügbare deutsche Frauenstimme, sonst eine lokal synthetisierte Stimme.

## Projekt

`dist/index.html`, `style.css`, `upgrade.css`: Garage und responsive Spieloberfläche. `game.js`: Eingabe, Kamera, Audio, Rettungsablauf und UI. `bike.js`: eigenes Motorradmodell, Sitzbänke, Fahrer, Beifahrer, Stunts, Materialien und Papagei. `bike-config.mjs`: Konfiguration und Leistungsklassen. `world.js`: Strecken und Umgebung in Three.js. `race-core.mjs`: unabhängige Rennsimulation einschließlich Stunts und Bergung. `tests/`: Tests für Rennregeln, beide Strecken, Klassen, Radaufstandspunkte und Rettung. `server.mjs`: lokaler statischer Server.

```sh
node --test tests/*.test.mjs
node --check dist/game.js
node --check dist/world.js
```

Three.js 0.170.0 ist lokal unter `dist/assets/` enthalten und steht unter der MIT-Lizenz. meSpeak 2.0.7 und die deutsche Stimme werden lokal mitgeliefert, einschließlich Lizenz und vollständiger JavaScript-Quellen unter `dist/assets/mespeak/src/`. Das Projekt wird unter GPLv3 bereitgestellt; die jeweiligen Hinweise für Fremdkomponenten bleiben gültig (siehe `LICENSE` und `THIRD_PARTY_NOTICES.md`). Schriftarten werden optional von Google Fonts geladen, mit Systemschriften als Fallback. Das Spiel benötigt weder Account noch Backend.

## Referenzen zur Fahrphysik

Die eigene, vereinfachte Arcade-Implementierung verwendet Grundideen wie gedämpftes Einlenken, Schräglage, Reifengrip und Lastwechsel. Als technische Referenzen dienten [Kright/MotorcyclePhysics](https://github.com/Kright/MotorcyclePhysics) und die [Reifen-Dokumentation von Vehicle Physics Pro](https://vehiclephysics.com/blocks/tires/). Es wurde kein Code oder Fahrzeugmodell aus diesen Projekten übernommen.

Eigenständiges Fanprojekt, keine offizielle Metorbike- oder Nintendo-Veröffentlichung. Die Sternenallee ist eine eigene Strecke; keine Mario-Kart-Figuren, Musik oder Spieldateien werden verwendet. Die Bike-Lackierungen unterscheiden sich optisch; die Spielwerte sind identisch und keine realen Fahrzeugdaten.
