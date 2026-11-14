/* kleid/zermatt.js · Hauswerte für oberflaeche.js (Suitenhotel Zurbriggen, Zermatt; Gastgeber Moni und Pirmin Zurbriggen; zermatt-maison 08.11.2026).
   Im <head> VOR allen Stilen laden (ohne defer). Rahmen «Die Bühne»: Kopf Anthrazit wie der Schriftzug ZURBRIGGEN, Raum Schnee, der rote Pinselzug als Zeichen.
   Liegt unter _werkzeuge/oberflaeche/ und wird von den Werkzeug-Servern unter /assets/oberflaeche/ ausgeliefert (einziger Schreiber: zermatt-maison, Kontrollpanel).
   Fotos und Schriften kommen aus der Website (/assets/bilder/<schlüssel>-<breite>.webp, /assets/fonts/), Wortmarke aus /assets/oberflaeche/kleid/zermatt-marke.svg#wm. */
window.WO_HAUS = { kurz: 'zermatt', name: 'Suitenhotel Zurbriggen', voll: 'Suitenhotel Zurbriggen, Zermatt', ort: 'Zermatt', bar: 'Suitenhotel Zurbriggen', haus: 'Suitenhotel Zurbriggen', welt: 'hotel', rahmen: 'buehne', anrede: 'Sie',   /* Schweizer Hotel: Sie-Ansprache */
  /* Aussenfoto des Startbilds: das Haus am Abend, davor der Garten (website/inhalt/bildliste.py «haus-abend», Stufen 900/1600/2560); Platzhalter = Mittelwert des Fotos */
  foto: '/assets/bilder/haus-abend-1600.webp', fotoKlein: '/assets/bilder/haus-abend-900.webp', fotoFarbe: '#534f4b',
  fotoStufen: [900, 1600], fotoAlt: 'Das Suitenhotel Zurbriggen am Abend, davor der Garten',
  /* Zeichen: der rote Pinselzug des Logos, unverändert (_kette/05-markenbauer/_bau/pinsel-roh.svg, wie website/bau.py PINSEL); Seitenverhältnis 1770:1650.
     Wortmarke wie der Kopf der Website (Pinsel + SUITENHOTEL / ZURBRIGGEN / ZERMATT), Schrift in Pfaden: <svg viewBox="0 0 1804 485"><use href="…#wm"/></svg>, Farbe der Schrift über color, des Pinsels über --wm-zeichen (Standard Rot) */
  zeichen: '/assets/oberflaeche/kleid/zermatt-zeichen.svg', zeichenMass: 1.073, wortmarke: '/assets/oberflaeche/kleid/zermatt-marke.svg#wm', wortmarkeMass: 3.72,
  /* Namen der sieben Werkzeuge: die EINE Stelle. Gleicher Satz wie im Stamm (Robert 28./29.10.2026); Dateien, Schlüssel und Adressen bleiben (maison, bureau, carte …). */
  namen: { zentrale: 'Kontrollpanel', website: 'Website bearbeiten', karten: 'Karten & Preislisten', gaeste: 'Anfragen & Chat', marke: 'Das Markenbuch', besuche: 'Besucher', druck: 'Drucksachen & Feed' },
  saetze: { zentrale: 'Hier beginnt alles: ein Blick auf alle Werkzeuge des Hauses und ihren Stand.',
    website: 'Die Website selbst pflegen: Texte, Fotos, Suiten, Pakete der Saison, Hinweise.',
    karten: 'Abendkarte, Fondue- und Frühstückskarte schreiben, daraus entstehen Karte und PDF.',
    gaeste: 'Fragen der Gäste zu Suiten, Anreise, Frühstück und Wellness, mit Antwortentwurf.',
    marke: 'Pinselzug, Wortmarke, Fotos, Farben und Schriften des Hauses an einem Ort.',
    besuche: 'Wer die Website besucht: woher, wann, welche Suiten er ansieht, wer buchen will.',
    druck: 'Aushänge, Karten, Briefe für die Suite und Beiträge in der Sprache des Hauses entwerfen.' },
  wege: { zentrale: '/_werkzeuge/maison/', website: '/_werkzeuge/bureau/', karten: '/_werkzeuge/carte/', gaeste: '/_werkzeuge/reception/', marke: '/_werkzeuge/livre/', besuche: '/_werkzeuge/registre/', druck: '/_werkzeuge/imprimerie/' },
  /* Prüfserver je Werkzeug (cloud/haus.json › server); Wege zwischen Werkzeugen immer 127.0.0.1, nie localhost (Fehlerbuch 10a) */
  ports: { zentrale: 9391, website: 9392, karten: 9393, gaeste: 9394, marke: 9395, besuche: 9396, druck: 9397, werkbank: 9398, website_lokal: 8927 } };
/* Lokal (Prüfserver je Werkzeug) zeigen die Wege zu den ANDEREN Werkzeugen auf deren eigenen Server unter 127.0.0.1, nie auf den eigenen Port
   (Fund im Stamm 28.10.2026: der Knopf zur Zentrale öffnete /_werkzeuge/maison/ auf dem eigenen Port ohne Stand-Wege; Fehlerbuch 10a). Online bleiben sie relativ.
   Wer selbst schon absolute Wege setzt: nur Wege umschreiben, die noch mit «/» beginnen (WO_HAUS.wegeLokal = true zeigt, dass es hier geschah). */
(function () {
  if (!/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
  Object.keys(WO_HAUS.wege).forEach(function (k) {
    var p = WO_HAUS.ports[k], w = WO_HAUS.wege[k];
    if (p && String(p) !== location.port && w.charAt(0) === '/') WO_HAUS.wege[k] = 'http://127.0.0.1:' + p + w;
  });
  WO_HAUS.wegeLokal = true;
})();
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
/* Bewegung der Werkzeuge (29.10.2026): bewegung.js neben oberflaeche.js, async und mit wenig Vorrang nachgeladen, damit es nie vor dem ersten Knopf steht */
(function () {
  var me = document.currentScript, s = document.createElement('script');
  s.src = (me && me.src ? new URL('../bewegung.js', me.src).href : '/assets/oberflaeche/bewegung.js') + '?v=3';   /* Fassung hochzählen, wenn bewegung.js sich ändert */
  s.async = true; s.setAttribute('fetchpriority', 'low'); document.head.appendChild(s);
})();
/* Titel fliegen zeilenweise hoch (Kriterium 37, 30.10.2026). WO_ZEILEN(el) setzt jedes Wort eines Titels in <span class="wo-w"> und schreibt die Zeile als --z daran;
   die Wörter einer Zeile steigen zusammen, Zeile für Zeile gestaffelt. Ändert sich dabei der Umbruch (Silbentrennung, sehr lange Wörter), bleibt der Titel unberührt.
   Hier im Kleid (ohne defer), damit der Titel des Startbilds schon vor dem ersten Bild geteilt ist; bewegung.js nutzt dieselbe Funktion für die Zwischentitel. */
window.WO_ZEILEN = function (el) {
  if (!el || el.hasAttribute('data-wo-zl')) return !!(el && el.classList.contains('wo-zl'));
  var h0 = el.offsetHeight; if (!h0) return false;   /* verborgen: später, wenn er zu sehen ist */
  el.setAttribute('data-wo-zl', '');
  var w0 = Math.max(el.scrollWidth, el.clientWidth), roh = el.innerHTML, tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), t, ts = [];
  while ((t = tw.nextNode())) if (/\S/.test(t.data) && !t.parentNode.closest('svg')) ts.push(t);
  if (!ts.length) return false;
  ts.forEach(function (t) {
    var f = document.createDocumentFragment();
    t.data.split(/(\s+)/).forEach(function (s) {
      if (!s) return;
      if (/^\s+$/.test(s)) { f.appendChild(document.createTextNode(s)); return; }
      var w = document.createElement('span'); w.className = 'wo-w'; w.textContent = s; f.appendChild(w);
    });
    t.parentNode.replaceChild(f, t);
  });
  if (el.offsetHeight !== h0 || el.scrollWidth > w0 + 1) { el.innerHTML = roh; return false; }
  var z = -1, oben = -1e9, halb = parseFloat(getComputedStyle(el).fontSize) * 0.5;
  el.querySelectorAll('.wo-w').forEach(function (w) { var y = w.getBoundingClientRect().top; if (y > oben + halb) { z++; oben = y; } if (z) w.style.setProperty('--z', z); });
  el.classList.add('wo-zl');
  return true;
};
/* Der Titel des Startbilds: geteilt, sobald er im Dokument steht (vor dem ersten Bild, der Auftritt beginnt erst nach 0,18 s) */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('MutationObserver' in window)) return;
  var plan = 0;
  function teile() {
    plan = 0;
    document.querySelectorAll('.wo-sb__h:not([data-wo-zl])').forEach(function (h) {
      if (document.documentElement.classList.contains('still')) return;
      var a = h.getAnimations ? h.getAnimations() : [];
      if (a.some(function (x) { return (x.currentTime || 0) > 120; })) { h.setAttribute('data-wo-zl', ''); return; }   /* läuft schon: bleibt ein Block, nie zurückspringen */
      WO_ZEILEN(h);
    });
  }
  new MutationObserver(function () { if (!plan && document.querySelector('.wo-sb__h:not([data-wo-zl])')) { plan = 1; Promise.resolve().then(teile); } })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
