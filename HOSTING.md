# Geplantes Online-Hosting auf Hetzner

## Vereinbarte Betriebsweise

GitHub bleibt die zentrale Quelle für das Spiel:

- Repository: https://github.com/Kurzhaardackel69/Metrobike-Rennspiel
- Entwicklungszweig für den Onlinebetrieb: `main`
- Ziel für den laufenden Spielbetrieb: der Hetzner-Server des Projektinhabers
- Öffentliche Spieladresse: eine noch auszuwählende Domain oder Subdomain
- Online erreichbar sein soll genau eine aktuelle, erfolgreich geprüfte Version.

Der Git-Verlauf bleibt vollständig auf GitHub. Die Vorgabe „nur die aktuelle Version auf dem Server“ bedeutet, dass Spieler unter einer festen Adresse die aktuelle Fassung erhalten; sie bedeutet keine Löschung alter Git-Commits. Automatische Updates sollen fehlerhafte Fassungen abfangen, bevor sie eine funktionierende Instanz ersetzen.

**Aktueller Stand:** Die Serveradresse antwortet per SSH. Der Schlüssel des Projektadmins wird beim Root-Zugang abgewiesen. Der Serverinhaber kann den öffentlichen Schlüssel des Projektadmins über seinen eigenen funktionierenden SSH-Zugang für den vereinbarten Linux-Benutzer hinterlegen. Domain, Veröffentlichung auf Hetzner, HTTPS und automatische Aktualisierung stehen aus.

## Die Begriffe

| Begriff | Bedeutung für dieses Spiel |
| --- | --- |
| Hetzner-Server | Ein Rechner bei Hetzner, auf dem die Website und die gemeinsame Rennsimulation laufen. Er bleibt erreichbar, wenn die PCs der Spieler ausgeschaltet sind. |
| Öffentliche IPv4-Adresse | Die numerische Internetadresse dieses Rechners, beispielsweise `203.0.113.42` als reine Beispieladresse. Sie besteht aus vier durch Punkte getrennten Zahlen. |
| Domain | Ein merkbarer Name für die Spieladresse. Er wird bei einem Domainanbieter registriert. |
| Subdomain | Eine zusätzliche Adresse unter einer vorhandenen Domain, etwa `rennen.example.com`. `example.com` ist hier ein Platzhalter. |
| DNS | Das System, das den Namen der Spieladresse einer Serveradresse zuordnet. Ein DNS-Eintrag vom Typ `A` verweist auf eine IPv4-Adresse. |
| HTTPS | Die verschlüsselte Verbindung zwischen Browser und Website. Dafür braucht die Domain ein gültiges Zertifikat. |
| WSS | Die verschlüsselte dauerhafte Verbindung für die Multiplayer-Rennstände. Sie soll über dieselbe Domain laufen. |
| SSH | Der geschützte Verwaltungszugang zum Server. Er dient der Einrichtung; Mitspieler brauchen keinen SSH-Zugang. |
| GitHub | Speicherort für den Quelltext, seine Änderungen und die Prüfungen. Der Server bezieht von dort die aktuelle Fassung. |
| Bereitstellung / Deployment | Das Übernehmen einer geprüften Spielversion auf den laufenden Server. |

Domain, DNS und Server können bei unterschiedlichen Anbietern liegen. Eine Domainregistrierung überträgt den Spielcode noch nicht auf einen Server. Ein DNS-Eintrag installiert ebenfalls keine Anwendung.

## Die Server-IP finden

Für einen Hetzner-Cloud-Server:

1. https://console.hetzner.com/ öffnen und anmelden.
2. Das Projekt auswählen, in dem der Spielserver angelegt wurde.
3. Unter **Server** den betreffenden Rechner auswählen.
4. In dessen Übersicht beziehungsweise Netzwerkinformationen die **öffentliche IPv4-Adresse** ablesen und kopieren.

Falls keine öffentliche IPv4 angezeigt wird, zuerst die vorhandene Netzwerkkonfiguration klären. Eine lokale WLAN-Adresse, `127.0.0.1` oder die Internetadresse des heimischen Routers ist kein Nachweis für die Adresse des Hetzner-Servers. Ein bereits vorhandenes lokales SSH-Profil muss deshalb mit den Angaben in Hetzner abgeglichen werden.

Die Server-IP ist eine Adresse, kein Anmeldegeheimnis. Passwörter, private SSH-Schlüssel und API-Tokens gehören nicht in diese Dokumentation oder in GitHub-Commits.

## So kommt das Spiel auf den Server

1. **Server bestätigen:** Öffentliche Adresse, Betriebssystem und vorhandenen Verwaltungszugang feststellen. Bestehende Dienste prüfen, bevor Ports oder Konfigurationen geändert werden.
2. **Code beziehen:** Das GitHub-Repository auf dem Server abrufen. Die Anwendung wird aus dem Quelltext bereitgestellt; die Windows-EXE wird dafür nicht benötigt.
3. **Spiel starten:** Die Webdateien aus `dist/` und den Multiplayer-Server aus `multiplayer/server.mjs` gemeinsam betreiben. Die vorhandene Simulation verwaltet bis zu fünf Teilnehmer pro Raum.
4. **Domain zuordnen:** Eine vorhandene Domain/Subdomain verwenden oder eine verfügbare Domain auswählen. Deren DNS-Eintrag verweist auf den bestätigten Hetzner-Server.
5. **HTTPS und WSS einrichten:** Ein vorgeschalteter Webserver, zum Beispiel Caddy, übernimmt Zertifikate und leitet Website und Multiplayer-Verbindung an die Spielanwendung weiter. Der Browser soll den richtigen Spielserver automatisch verwenden.
6. **Online prüfen:** Website, Raum erstellen/beitreten, ein Rennen auf zwei Geräten und die verschlüsselte Verbindung kontrollieren.
7. **Updates automatisieren:** Neue Änderungen weiter nach GitHub `main` übertragen. Der Server soll Änderungen regelmäßig erkennen, prüfen und die laufende Fassung aktualisieren. Die konkrete Umsetzung wird nach Prüfung des Servers eingerichtet und hier ergänzt.

Eine passende Umsetzung ist eine gemeinsame Installation aus Spielserver und Caddy mit Docker Compose sowie einem regelmäßigen Aktualisierungsdienst. Das ist eine Empfehlung für die weitere Einrichtung, keine bereits installierte Infrastruktur.

## Was Spieler später machen

Spieler öffnen dieselbe HTTPS-Spieladresse im Browser, wählen ihren Namen und erstellen einen Raum oder treten mit dessen Raumcode bei. Sie müssen dann keine privaten IP-Adressen oder wechselnden PC-Ports mehr austauschen. Eine zusätzliche Benutzerverwaltung mit eigenen Konten ist bisher nicht Bestandteil des Spiels.

Ein zentraler Server erleichtert das gemeinsame Spielen aus unterschiedlichen Netzwerken. Die Grafik wird weiterhin auf den Geräten der Spieler gezeichnet; Hosting allein garantiert deshalb keine höhere Bildrate.

Bei einer Aktualisierung kann die laufende Rennsimulation neu starten. Räume und laufende Rennen werden derzeit im Arbeitsspeicher gehalten und überstehen einen Serverneustart nicht. Die noch einzurichtende Aktualisierung muss dieses Verhalten berücksichtigen.

## Noch benötigte Angaben

- Bestätigte öffentliche Serveradresse aus Hetzner
- Betriebssystem und funktionierender Verwaltungszugang
- Gewünschte Domain oder vorhandene Subdomain
- Anbieter, bei dem deren DNS-Einträge verwaltet werden
- Bei einer neuen Domain: Auswahl, Verfügbarkeit und Preis vor einer Registrierung

## Offizielle Hintergrundinformationen

- [Hetzner: Mit dem Server verbinden](https://docs.hetzner.com/cloud/servers/getting-started/connecting-to-the-server/)
- [Hetzner: A-Eintrag für IPv4](https://docs.hetzner.com/networking/dns/record-types/a-record/)
- [Caddy: automatisches HTTPS](https://caddyserver.com/docs/automatic-https)
- [Caddy: Reverse Proxy und WebSocket-Verbindungen](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

## Umsetzung im Intranet (Stand 26.11.2026)

Das Spiel läuft als eigener Container neben dem Intranet auf demselben Hetzner-Server (`/srv/rennspiel`) unter `https://rennen.metorbike.de`.

- Das Image (`Dockerfile`) führt beim Bauen Syntaxprüfung und alle Tests aus. Scheitert etwas, entsteht kein Image und die laufende Fassung bleibt. Im Image liegen nur `dist/` ohne Downloads und der Rennserver (rund 15 MB Spiel plus Node).
- Ein offener Port fehlt absichtlich (`docker-compose.server.yml`). Der Caddy des Intranets (Repository metorbike-erp, `Caddyfile.server`) erreicht das Spiel über das Netzwerk `rennspiel`, das die ERP-Seite anlegt. App und Datenbank des Intranets sind für das Spiel nicht erreichbar.
- Einstieg: fünfmal auf „Engineering“ in der oberen Leiste, dann die Kachel auf der versteckten Seite `/spiele`. Der Link hängt `#intranet=1&name=<Benutzer>` an. Damit tritt das Spiel unter **2D MX** automatisch dem gemeinsamen Warteraum bei (Nachricht `lobby`). Der Erste ist Gastgeber und gibt das Rennen frei. Läuft schon ein Rennen, öffnet sich ein neuer Warteraum.
- Update: Stand nach GitHub `main` senden, dann `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\server-update.ps1` (SSH-Schlüssel im ssh-agent). Laufende Rennen gehen beim Wechsel verloren.
- Lokal: `docker compose up -d --build`, dann `http://localhost:8787/#intranet=1&name=Test` in zwei Tabs.
