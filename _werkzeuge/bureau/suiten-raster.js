/* suiten-raster.js · Angaben je Suite (Website bearbeiten, Suitenhotel Zurbriggen, Zermatt; Robert 10.11.2026: «4 in einer Reihe und 2 da drunter … niemals ästhetisch»).
   Der Stamm (website.js › zeichneHaus) zog die geöffnete Suite als breite Karte mitten ins Raster; die übrigen Kacheln zerfielen in ungleiche Reihen (2 · 4 · 2).
   Hier bleiben alle acht Kacheln in gleichen Reihen stehen (4 + 4, schmaler 2 je Reihe), die gewählte ist markiert, und ihre Felder stehen als eine breite Karte
   gleich unter der Reihe der gewählten Kachel (am Handy direkt unter ihr), mit Foto, Zeile und Name oben wie in der Vorlage (Schaufenster Monte-Moro › Zimmer und Wohnungen). Es wird nur verschoben, nichts neu gebaut:
   die Felder des Stamms behalten ihre Knöpfe und Wege; schliesst die Kachel, gehen sie in sie zurück. Immer eine Suite zugleich. */
(function () {
  'use strict';
  var mitte = document.getElementById('ws-mitte');
  if (!mitte) return;
  var nutzer = false;   // nur nach einem Klick auf eine Kachel zur Karte scrollen, nie beim Neuzeichnen nach dem Speichern

  function karteFuer(r) {
    var k = r.querySelector(':scope > .zm-angaben');
    if (k) return k;
    k = document.createElement('section');
    k.className = 'platte zm-angaben';
    k.setAttribute('aria-live', 'polite');
    r.append(k);
    return k;
  }
  // die Karte steht nach der letzten Kachel derselben Reihe (Reihenfolge über «order», die Kacheln bleiben, wo sie sind)
  function stelle(r, kacheln, gewaehlt, karte) {
    kacheln.forEach(function (d, i) { d.style.order = String(2 * i); });
    karte.style.order = '999';   // zum Messen ans Ende, damit sie keine Reihe bricht
    var y = gewaehlt.offsetTop, ende = 0;
    kacheln.forEach(function (d, i) { if (Math.abs(d.offsetTop - y) < 3) ende = i; });
    karte.style.order = String(2 * ende + 1);
  }

  function ordne() {
    var r = mitte.querySelector('.ws-eintraege');
    if (!r) return;
    r.classList.add('zm-raster');
    var kacheln = Array.prototype.slice.call(r.querySelectorAll(':scope > details.ws-eintrag'));
    var offen = kacheln.filter(function (d) { return d.open; });
    // immer eine zugleich: die zuletzt geöffnete bleibt (sonst die erste)
    var bleibt = offen.filter(function (d) { return d === ordne.zuletzt; })[0] || offen[0] || null;
    offen.forEach(function (d) { if (d !== bleibt) d.open = false; });
    var karte = r.querySelector(':scope > .zm-angaben');
    // Felder einer geschlossenen Kachel zurück in sie
    kacheln.forEach(function (d) {
      d.classList.toggle('zm-gewaehlt', d === bleibt);
      var summary = d.querySelector(':scope > summary');
      if (summary) summary.setAttribute('aria-expanded', d === bleibt ? 'true' : 'false');
      if (d !== bleibt && d.__zmInnen && d.__zmInnen.parentNode !== d) d.append(d.__zmInnen);
    });
    if (!bleibt) { if (karte) karte.remove(); return; }
    var innen = bleibt.__zmInnen || bleibt.querySelector(':scope > .ws-eintrag__innen');
    if (!innen) return;
    bleibt.__zmInnen = innen;
    karte = karteFuer(r);
    if (karte.__zmVon !== bleibt) {
      karte.textContent = '';
      var kopf = document.createElement('div');
      kopf.className = 'zm-angaben__kopf';
      var b = bleibt.querySelector(':scope > summary > .ws-eintrag__b');
      var t = bleibt.querySelector(':scope > summary > .ws-eintrag__t');
      if (b) kopf.append(b.cloneNode(true));
      if (t) { var tk = t.cloneNode(true); var auf = tk.querySelector('.ws-eintrag__auf'); if (auf) auf.remove(); kopf.append(tk); }
      karte.append(kopf);
      karte.__zmVon = bleibt;
      karte.setAttribute('data-ws-eintrag', bleibt.getAttribute('data-ws-eintrag') || '');
    }
    if (innen.parentNode !== karte) karte.append(innen);
    stelle(r, kacheln, bleibt, karte);
    if (nutzer) {
      nutzer = false;
      var oben = karte.getBoundingClientRect().top, kopfH = (document.getElementById('ws-kopf') || { offsetHeight: 0 }).offsetHeight;
      if (oben > innerHeight - 160 || oben < kopfH) window.scrollTo({ top: scrollY + oben - kopfH - 24, behavior: 'smooth' });
    }
  }
  ordne.zuletzt = null;

  // toggle steigt nicht auf: im Einfangen hören
  mitte.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!d || !d.matches || !d.matches('.ws-eintraege > details.ws-eintrag')) return;
    if (d.open) ordne.zuletzt = d;
    ordne();
  }, true);
  mitte.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.ws-eintraege > details.ws-eintrag > summary')) nutzer = true;
  }, true);
  window.addEventListener('resize', function () {
    var r = mitte.querySelector('.ws-eintraege.zm-raster'), k = r && r.querySelector(':scope > .zm-angaben');
    if (k && k.__zmVon) stelle(r, Array.prototype.slice.call(r.querySelectorAll(':scope > details.ws-eintrag')), k.__zmVon, k);
  });
  // nach jedem Neuzeichnen des Stamms (Speichern, Weltwechsel) wieder ordnen
  var wartet = false;
  new MutationObserver(function () {
    if (wartet) return;
    wartet = true;
    requestAnimationFrame(function () { wartet = false; ordne(); });
  }).observe(mitte, { childList: true });
})();
