/* pruefung-haus.js · Prüfseite im Rahmen des Suitenhotels Zurbriggen, Zermatt (08.11.2026; Vorlage: Website bearbeiten des Stamms): Name des Werkzeugs aus der einen Stelle, «Zum Werkzeug» führt in dieses Werkzeug, nicht in den Stamm. */
(function () {
  var z = document.getElementById('wsp-zurueck'); if (z) z.href = '/_werkzeuge/bureau/';
  var n = window.WO_HAUS && WO_HAUS.namen && WO_HAUS.namen.website;
  /* welt.js des Stamms füllt [data-werkzeug] erst nach dem Laden mit seinem Weltnamen («Le Bureau»): der Name des Hauses wird danach noch einmal gesetzt */
  function setze() { if (n) { document.querySelectorAll('[data-werkzeug]').forEach(function (e) { if (e.textContent !== n) e.textContent = n; }); document.title = 'Prüfung · ' + n + ' · ' + WO_HAUS.name; } }
  setze(); document.addEventListener('DOMContentLoaded', setze); window.addEventListener('load', function () { setze(); setTimeout(setze, 200); });
})();
/* Pakete der Saison (Zermatt 08.11.2026, Vorlage: Termine des Culinarium): eigener Teil der Prüfung (Quelle website/inhalt/haus.py › PAKETE, Stellen der Seiten,
   Speicher, Sicherung) und die Lexikon-Einträge der Stichworte aus termine.py und termine-ansicht.js. Das Lexikon des Stamms bleibt unverändert; diese Einträge
   stehen darunter mit eigener Kennung lex-<stichwort> und öffnen sich, wenn «Was tun?» dorthin führt. */
(function () {
  var LEX = [
    { id: 'termine-quelle', titel: 'Die Pakete der Website sind nicht lesbar', sehen: 'Die Ansicht «Pakete der Saison» startet nicht, oder hier steht «Pakete der Website» rot.',
      grund: 'Die Pakete stehen auf der Website als Listen «PAKETE» und «PAKETE_TAGE» in website/inhalt/haus.py. Die Website wurde umgebaut und die Listen fehlen oder haben eine neue Form.',
      tun: 'Nichts ist verloren: Entwurf und veröffentlichte Pakete liegen im Speicher des Werkzeugs. Die Listen in website/inhalt/haus.py wieder so bauen lassen (Name und Zeitraum, erster und letzter Tag), dann diese Seite neu laden.' },
    { id: 'termine-stelle', titel: 'Eine Seite hat keinen Platz mehr für die Pakete', sehen: 'Hier steht «Stellen auf den Seiten» rot, oder Saisonkalender und Startseite zeigen nach dem Veröffentlichen die alten Pakete.',
      grund: 'Die Seite «Zermatt» oder die Startseite wurde umgebaut; die Stelle, an der die Pakete stehen, sieht anders aus.', tun: 'Die Website zeigt weiter ihre gebauten Pakete. Die Seiten neu bauen lassen, dann diese Seite neu laden.' },
    { id: 'termine-speicher', titel: 'Der Speicher der Pakete ist beschädigt', sehen: 'Meldung «SPEICHER · Die Datei der Pakete und ihre Sicherung sind beide unlesbar».',
      grund: 'Die Datei _werkzeuge/bureau/_daten/termine.json und ihre Sicherung termine.json.gut sind beide beschädigt (zum Beispiel von Hand geändert).',
      tun: 'Die Website zeigt weiter die Pakete, wie sie gebaut ist. Die Datei aus einer Sicherung des Rechners zurückholen oder beide Dateien entfernen: dann gilt wieder der ursprüngliche Stand.' },
    { id: 'termin-datum', titel: 'Diesen Tag gibt es nicht', sehen: 'Meldung «DATUM · Der erste (letzte) Tag fehlt oder den Tag gibt es nicht», die Karte zeigt «Den ersten Tag gibt es nicht».',
      grund: 'Tag und Monat passen nicht zusammen, zum Beispiel der 31. November.', tun: 'Tag, Monat und Jahr neu wählen, dann speichern.' },
    { id: 'termin-folge', titel: 'Der letzte Tag liegt vor dem ersten', sehen: 'Meldung «ZEITRAUM · Der letzte Tag liegt vor dem ersten».',
      grund: 'Beim Verschieben wurde nur einer der beiden Tage geändert.', tun: 'Den ersten oder den letzten Tag neu wählen, dann speichern.' },
    { id: 'termin-saison', titel: 'Das Paket liegt ausserhalb des Winters', sehen: 'Meldung «SAISON · Der Kalender der Website zeigt den Winter vom 1. November 2026 bis 30. April 2027».',
      grund: 'Der Saisonkalender auf der Seite «Zermatt» spannt genau diesen Winter; ein Paket davor oder danach hätte dort keinen Platz.', tun: 'Die Tage innerhalb des Winters wählen. Pakete einer neuen Saison kommen mit dem nächsten Seitenbau.' },
    { id: 'termin-name', titel: 'Der Name fehlt', sehen: 'Meldung «NAME · Wie heisst das Paket?», die Karte zeigt «Wie heisst das Paket?».',
      grund: 'Das Feld «Name des Pakets» ist leer. Ohne Namen steht im Saisonkalender nur ein Balken.', tun: 'Den Namen eintragen, so wie er bei Zermatt Tourismus steht, dann speichern.' },
    { id: 'termin-lang', titel: 'Der Name ist zu lang', sehen: 'Meldung «ZU LANG · Der Name hat höchstens 60 Zeichen».',
      grund: 'Der Name passt nicht mehr in die Zeile des Saisonkalenders.', tun: 'Kürzer schreiben, so wie das Paket bei Zermatt Tourismus heisst.' },
    { id: 'termin-zeichen', titel: 'Klammern im Namen', sehen: 'Meldung «ZEICHEN · spitze und geschweifte Klammern stehen nicht auf der Website».',
      grund: 'Im Namen steht ein Zeichen wie < > { }.', tun: 'Das Zeichen herausnehmen, dann speichern.' },
    { id: 'termin-doppelt', titel: 'Zwei Pakete mit demselben Namen', sehen: 'Meldung «DOPPELT · Ein Paket mit diesem Namen steht schon in der Liste».',
      grund: 'Ein Paket wurde zweimal angelegt.', tun: 'Eines der beiden umbenennen, oder es mit «Wieder entfernen» herausnehmen.' },
    { id: 'termin-leer', titel: 'Kein Paket mehr in der Liste', sehen: 'Meldung «LEER · Mindestens ein Paket bleibt auf der Seite».',
      grund: 'Saisonkalender und Startseite zeigen die Pakete des Winters; ohne Paket stünde dort eine leere Fläche.', tun: '«Wie gespeichert» oder «Neues Paket» füllt die Liste wieder, dann speichern.' },
    { id: 'termin-viele', titel: 'Zu viele Pakete', sehen: 'Meldung «PAKETE · Höchstens 12 Pakete stehen gleichzeitig im Saisonkalender».',
      grund: 'Jedes Paket hat im Saisonkalender eine eigene Zeile; mehr als 12 machen ihn unruhig.', tun: 'Abgelaufene Pakete «Von der Seite nehmen», dann speichern.' },
    { id: 'termin-falsch', titel: 'Ein Paket ist unvollständig', sehen: 'Meldung «PAKET · …» mit Kennung oder Liste.',
      grund: 'Die Anfrage kam nicht aus dem Werkzeug oder wurde unterwegs verändert.', tun: 'Die Seite neu laden und die Eingabe wiederholen. Bleibt es, den Wortlaut der Meldung Ihrem Ansprechpartner schicken.' },
    { id: 'fassung-unbekannt', titel: 'Diese frühere Fassung gibt es nicht mehr', sehen: 'Meldung «FASSUNG · Diese frühere Fassung gibt es nicht».',
      grund: 'Die Liste der früheren Fassungen hält die letzten 60; ältere fallen heraus.', tun: 'Die Seite neu laden und eine Fassung aus der Liste wählen, oder den ursprünglichen Stand.' },
    { id: 'netz', titel: 'Der Server antwortet nicht', sehen: 'Meldung «NETZ · Der Server des Werkzeugs antwortet nicht».',
      grund: 'Die Verbindung ist weg oder der Server des Werkzeugs läuft nicht.', tun: 'Ihre Eingaben bleiben stehen. Verbindung prüfen, dann noch einmal «Speichern». Läuft der Server nicht: python3 _werkzeuge/bureau/serve.py 9392 im Hausordner.' }
  ];
  function el(tag, attrs, kinder) { var e = document.createElement(tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); (kinder || []).forEach(function (k) { e.append(k); }); return e; }
  var lex = document.querySelector('[aria-labelledby="wsp-t4"]');
  if (!lex) return;
  var teil = el('section', { class: 'wsp-teil', 'aria-labelledby': 'wsp-t-termine', 'data-cu-pruefung': 'termine' }, [
    el('div', {}, [el('p', { class: 'kap' }, [el('span', {}, ['Viertens'])]), el('h2', { class: 't-zwischen', id: 'wsp-t-termine' }, ['Pakete der Saison'])]),
    el('div', { class: 'platte wsp-punkte', id: 'cu-termine-punkte' }, [el('p', { class: 'wsp-wartet' }, ['Wird geprüft …'])])]);
  lex.parentNode.insertBefore(teil, lex);
  var ort = el('div', { class: 'wsp-lexikon', id: 'cu-lexikon' });
  lex.append(el('p', { class: 'kap', style: 'margin-top:28px' }, [el('span', {}, ['Pakete der Saison'])]), ort);
  LEX.forEach(function (l) {
    ort.append(el('details', { class: 'platte wsp-lex', id: 'lex-' + l.id }, [el('summary', {}, [l.titel]),
      el('dl', {}, [el('dt', { class: 'angabe' }, ['Sehen']), el('dd', {}, [l.sehen]), el('dt', { class: 'angabe' }, ['Grund']), el('dd', {}, [l.grund]), el('dt', { class: 'angabe' }, ['Tun']), el('dd', {}, [l.tun])])]));
  });
  function oeffne() {
    var e = location.hash.indexOf('#lex-') === 0 && document.getElementById(location.hash.slice(1));
    if (e && ort.contains(e)) { e.open = true; setTimeout(function () { e.scrollIntoView({ block: 'start' }); }, 0); }
  }
  window.addEventListener('hashchange', oeffne); oeffne();
  ['/_werkzeuge/bureau/api/termine/pruefung'].forEach(function (adr, nr) { fetch(adr, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
    var p = document.getElementById('cu-termine-punkte'), w = p.querySelector('.wsp-wartet'); if (w) w.remove();
    (d.punkte || []).forEach(function (x) {
      p.append(el('div', { class: 'wsp-punkt', 'data-gut': x.gut ? 'ja' : 'nein', 'data-punkt': nr ? 'gaeste' : 'termine', style: 'order:' + nr }, [
        el('span', { class: 'wsp-punkt__z' }, [x.gut ? '✓' : '–']), el('span', { class: 'wsp-punkt__t' }, [x.titel]),
        el('span', { class: 'wsp-punkt__x' }, [x.text + ' ', !x.gut && x.stichwort ? el('a', { href: '#lex-' + x.stichwort }, ['Was tun?']) : ''])]));
    });
  }).catch(function () { var p = document.getElementById('cu-termine-punkte'); p.textContent = 'Der Server des Werkzeugs antwortet nicht (Stichwort netz).'; }); });
})();
