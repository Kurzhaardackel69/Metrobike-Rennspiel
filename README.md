# Metorbike Racing Club

Ein 3D-Arcade-Rennspiel, inspiriert von den handgefertigten Café-Racern von [Metorbike Hamburg](https://metorbike.de/).

- Zwei eigene Strecken: **Kartbahn** bei Tageslicht und **Sternenallee**, eine leuchtende Regenbogenstrecke im All.
- **Spielername, 1–10 Runden und drei Schwierigkeiten** (Locker / Normal / Profi). Fünf Computerfahrer, Positionen, Minimap und persönliche Bestzeiten getrennt nach Strecke, Leistungsklasse, Rundenzahl und Schwierigkeit.
- Detailliertes eigenes Café-Racer-Modell mit offenem U-Rahmen, tiefem Motor, Speichenrädern, gebohrten Bremsscheiben, Lederstruktur und reflektierendem Lack.
- Vier Lackierungen und eine drehbare 360°-Ansicht per Ziehen, Pfeiltasten, Regler und Drehtasten.
- **2-kW- und 4-kW-Klasse** mit unterschiedlicher Arcade-Leistung und getrennten Streckenrekorden; die Computerfahrer fahren in derselben Klasse.
- **Einzel-, Höcker- oder Doppelsitz**, Leder in Dunkelbraun, Cognac oder Schwarz, optionaler Beifahrer. Ein Beifahrer aktiviert automatisch den Doppelsitz.
- **Stummellenker oder hoher Lenker**, mit dazu passender Handposition des Fahrers. Kürzerer Tank mit Freiraum zur Gabel und kompakte Schutzbleche.
- **Freie Fahrtrichtung ohne automatische Streckenführung**: Nur Lenkeingaben ändern die Richtung in der Welt. Nach dem Loslassen fährt das Bike geradeaus in seiner zuletzt eingeschlagenen Richtung weiter. Schräglage, Grip und Lastwechsel bleiben erhalten.
- Aufladbarer Boost, Boost-Felder, Kollisionen und Grasverzögerung.
- Bis ca. 54° Schräglage, **Wheelie beim Boost**, **Stoppie bei Vollbremsung** aus höherem Tempo. Beide Stunts drehen das Motorrad um den Radaufstandspunkt.
- Auf der **Sternenallee kann man herunterfallen**. Ein animierter Papagei hebt Bike und Fahrer wieder auf die Strecke. Eine Nahaufnahme zeigt einen großen Haufen sichtbar vom Vogel auf den Fahrerhelm fallen. Danach schmilzt der Haufen langsam zusammen: fünf sichtbare Spuren laufen über die Helmschale und Tropfen lösen sich unten ab. Das Rennen läuft während der Bergung weiter; die Bergung überspringt keine Streckenteile.
- Der Papagei wird mit jedem Absturz im Rennen frecher. Unter **🦜 Papagei** lassen sich eigene Sprüche (eine Zeile pro Absturz, bis zu 12 Zeilen), Platzhalter `{name}` / `{sturz}` und zwei krächzende Stimmen konfigurieren und anhören. Die letzte Zeile wird bei weiteren Stürzen wiederholt. Alle Texte und Einstellungen bleiben im Browser gespeichert.
- Eine als Frau gestaltete Beifahrerin mit Gesicht, Pferdeschwanz und Motorradkleidung reagiert auf Wheelies und Stoppies: kurze Schlaganimation gegen den Fahrer und „Lass den Scheiß!“. Die Animation beeinflusst das Fahrverhalten nicht.
- **Drei wählbare Motorsounds:** V2-Blubberbox, Racing-Krawalltüte und Elektro-Surren. **Drei eigene Musikkanäle**: Kettenfett FM, Papagei Paradise und Kosmos-Kasper, lokal per Web Audio komponiert. Musik, Sprache/Schreie und Motor/Effekte haben eigene Lautstärkeregler und Aus-Schalter. Musik und Motor werden bei Dialogen leiser.
- **Spotify-Verknüpfung im Radio:** „Spotify extern“ öffnet die Anmeldung und Wiedergabe direkt bei Spotify. Eigene Radio-/Mix-Playlists können mit Namen lokal gespeichert, ausgewählt, geöffnet und entfernt werden (max. 20). Währenddessen pausiert die Spielmusik; Sprach- und Motorsound bleiben separat einstellbar. Spotify-Wiedergabe, Login und Lautstärke werden ausschließlich bei Spotify bedient. Es werden keine Spotify-API, kein SDK, kein eingebetteter Player und keine Kontozugriffstokens verwendet.
- **Pistole (F / FEUER):** sichtbare Waffe, Mündungsblitz und Flugspur, Zielhilfe für Gegner vor dem Bike, sechs Schuss mit automatischem Nachladen. Treffer lösen Schreie und getrennte Fahrer-/Bike-Sturzanimationen aus. Getroffene Gegner verlieren 3,4 Sekunden und steigen anschließend wieder auf; kurze Schutzzeit verhindert Dauertreffer beim Aufstehen.
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
| Schießen | F halten | FEUER rechts |
| Radiosender wechseln | M / Senderanzeige | Senderanzeige antippen |
| Musik, Sprache, Motor einstellen | ♫ Radio | ♫ oben rechts |
| Zurück auf die Strecke | R, außerhalb einer laufenden Bergung | Papagei rettet dich nach einem Sturz automatisch |
| Pause | Esc / P | Pause oben rechts |

Vor engen Kurven bremsen und ruhig einlenken: abrupte Richtungswechsel bei hohem Tempo benötigen Zeit. Boost lädt sich von selbst wieder auf. Gelbe Felder aktivieren einen kurzen Boost und laden Energie nach. Beim Verlassen des Fensters pausiert das Rennen automatisch. Im Hochformat fordert das Spiel zum Drehen auf. Pfeiltasten verändern ausschließlich die Kamera; nach dem Loslassen kehrt sie zur Rennansicht zurück. Standarddialoge (Absturz 1–20), Beifahrerin und Treffer verwenden mit Piper vorbereitete deutsche neuronale Sprachaufnahmen, ohne die vorherige starke Verzerrung. Eigene Sprüche und weitere Absturzzahlen nutzen bevorzugt eine deutsche Systemstimme, je nach Browser auch eine Onlinestimme. Nur wenn keine deutsche Gerätestimme verfügbar ist, kommt die unverzerrte meSpeak-Ersatzstimme zum Einsatz. Die Klangqualität eigener Texte hängt daher vom Gerät ab. Die Musik besteht aus eigenen kurzen Instrumental-Kompositionen; es werden keine fremden Musikaufnahmen gestreamt.

## Projekt

`dist/index.html`, `style.css`, `upgrade.css`: Garage und responsive Spieloberfläche. `game.js`: Eingabe, Kamera, Audio, Rettungsablauf und UI. `bike.js`: eigenes Motorradmodell, Sitzbänke, Fahrer, Beifahrer, Stunts, Materialien und Papagei. `bike-config.mjs`: Konfiguration und Leistungsklassen. `world.js`: Strecken und Umgebung in Three.js. `race-core.mjs`: unabhängige Rennsimulation einschließlich Stunts und Bergung. `tests/`: Tests für Rennregeln, beide Strecken, Klassen, Radaufstandspunkte und Rettung. `server.mjs`: lokaler statischer Server.

```sh
node --test tests/*.test.mjs
node --check dist/game.js
node --check dist/world.js
```

Three.js 0.170.0 ist lokal unter `dist/assets/` enthalten und steht unter der MIT-Lizenz. meSpeak 2.0.7 und die deutsche Stimme werden lokal mitgeliefert, einschließlich Lizenz und vollständiger JavaScript-Quellen unter `dist/assets/mespeak/src/`. Das Projekt wird unter GPLv3 bereitgestellt; die jeweiligen Hinweise für Fremdkomponenten bleiben gültig (siehe `LICENSE` und `THIRD_PARTY_NOTICES.md`). Schriftarten werden optional von Google Fonts geladen, mit Systemschriften als Fallback. Das Spiel benötigt weder Account noch Backend.

## Spotify-Verknüpfung

Spotify schließt Spiele in [Abschnitt III.2 der Developer Policy](https://developer.spotify.com/policy#iii-some-prohibited-applications) von der Nutzung seiner Entwicklerschnittstelle aus. Daher implementiert diese Version ausschließlich externe Links und lokale Lesezeichen, keinen Spotify-OAuth-Login und keine Fernsteuerung der Wiedergabe. Die UI zeigt keinen erfundenen Anmeldestatus. Es ist keine Spotify-Client-ID nötig. Anmeldung erfolgt auf `accounts.spotify.com`, Wiedergabe auf `open.spotify.com`.

Unter ♫ → Spotify extern bei Spotify anmelden. Ein Künstler-, Album- oder Song-Radio [bei Spotify als Playlist speichern](https://support.spotify.com/de/article/spotify-radio/), über Teilen den Playlist-Link kopieren und im Spiel mit einem frei gewählten Namen ablegen. Nur vollständige HTTPS-Links zu `open.spotify.com/playlist/<ID>` (auch mit `intl-de/`) oder `spotify:playlist:<ID>` werden akzeptiert. Trackingparameter werden entfernt. Gespeicherte Links sind keine Garantie, dass eine private Playlist für ein anderes Spotify-Konto zugänglich ist.

Clubradio-Musikregler und globaler Spiel-Mute steuern ausschließlich Spielaudio. Spotify-Lautstärke, Wiedergabe und Abmeldung bleiben im Spotify-Tab. Auf Mobilgeräten hängt gleichzeitige Audiowiedergabe vom Browser und Betriebssystem ab.

## Sprachaufnahmen neu erzeugen

`scripts/bake-voices.mjs` verwendet das offizielle Piper-Windows-Paket 2023.11.14-2 und die Modelle `de_DE-thorsten_emotional-medium` sowie `de_DE-kerstin-low` vom Tag `v1.0.0`. Die CC0-Datensatzquellen und Downloadlinks sind in `THIRD_PARTY_NOTICES.md` dokumentiert. Werkzeug und Modelle liegen nur im ignorierten `reference/`-Ordner; ausgeliefert werden 24 WAV-Aufnahmen mit zusammen etwa 5 MB. Nach Änderung der Standardsprüche `node scripts/bake-voices.mjs` ausführen.

## Referenzen zur Fahrphysik

Die eigene, vereinfachte Arcade-Implementierung verwendet Grundideen wie gedämpftes Einlenken, Schräglage, Reifengrip und Lastwechsel. Als technische Referenzen dienten [Kright/MotorcyclePhysics](https://github.com/Kright/MotorcyclePhysics) und die [Reifen-Dokumentation von Vehicle Physics Pro](https://vehiclephysics.com/blocks/tires/). Es wurde kein Code oder Fahrzeugmodell aus diesen Projekten übernommen.

Eigenständiges Fanprojekt, keine offizielle Metorbike- oder Nintendo-Veröffentlichung. Die Sternenallee ist eine eigene Strecke; keine Mario-Kart-Figuren, Musik oder Spieldateien werden verwendet. Die Bike-Lackierungen unterscheiden sich optisch; die Spielwerte sind identisch und keine realen Fahrzeugdaten.

## Android-Test-APK 1.4.0

Das native Android-Projekt liegt unter android/. Es enthält das Spiel lokal, läuft im Querformat und passt WebView/Canvas an die verfügbare Displayfläche an. Android 8 oder neuer ist erforderlich. Google Fonts und externe Spotify-Links benötigen Internet; das Rennen selbst und die vorbereiteten Stimmen sind enthalten.

Im Radio „Spotify extern“ wählen und „In Spotify-App öffnen“ verwenden. Nach dem Starten der Musik in Spotify zum Spiel zurückwechseln. Ein Spotify-Webplayer-Tab muss für seine eigene Wiedergabe offen bleiben; die Spotify-App ist davon unabhängig. Damit sie auf Android nicht vom Spielaudio unterbrochen wird, wird das Spielaudio während dieser Auswahl pausiert. Bei Appwechsel pausiert das Rennen. Beim Beenden oder Neuladen endet die aktive Spotify-Auswahl, gespeicherte Radios bleiben erhalten. Das Spiel besitzt keinen Spotify-Kontozugriff und kann die unabhängige Spotify-App weder pausieren noch abmelden.

Der GitHub-Actions-Workflow „Android APK“ prüft sechs Displaygrößen, Rotation, Spotify-Auswahl und 50 Simulationstests. Danach baut und signaturprüft er die Debug-APK. Das herunterladbare Artefakt heißt „Metorbike-Racing-APK“. Der lokale Build benötigt JDK 17, Android SDK 35 und Gradle 8.13: erst node scripts/prepare-android.mjs, dann gradle -p android assembleDebug. Das Ergebnis liegt unter android/app/build/outputs/apk/debug/app-debug.apk.

Es handelt sich um eine signierte Test-APK, keine Play-Store-Version. Der CI-Debug-Schlüssel ist nur für den jeweiligen Build gedacht; ein späterer Build kann eine Neuinstallation erfordern. Für eine dauerhafte Release-Veröffentlichung ist ein eigener, sicher verwahrter Signierschlüssel notwendig. Die App wurde nicht auf einem echten Telefon mit angemeldetem Spotify-Konto geprüft.
