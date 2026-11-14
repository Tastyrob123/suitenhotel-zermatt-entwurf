/* termine-ansicht.js · Website bearbeiten (Suitenhotel Zurbriggen, Zermatt, 08.11.2026; Vorlage: die Ansicht «Termine» des Culinarium, 28.10.2026,
   und «DJ-Abende» von Wild Side, 31.10.2026): Ansicht «Pakete der Saison» im Schreibtisch des Stamms (window.WS_EIGEN, website.js).
   Die Pakete des Hauses für den Winter 2026/27 sind auf der Website Daten (website/inhalt/haus.py › PAKETE, PAKETE_TAGE), kein Text: der Server liest
   sie (termine.py), hier werden sie gepflegt. Aus ihnen entstehen der Saisonkalender «Der Winter als Startliste.» auf der Seite «Zermatt» und die
   Liste der Pakete am Schluss der Startseite. Eingaben warten markiert und zählen in der Leiste mit; «Speichern» der Leiste legt sie in den Entwurf,
   «Veröffentlichen» bringt sie (mit den Änderungen an Texten und Fotos) auf die Website (Probe-Kopie). Frühere Fassungen und der ursprüngliche Stand
   lassen sich zurückholen. Vor website.js laden. Kein fester Farbwert: alles aus dem Kleid (--wo-*). */
(function () {
  'use strict';
  var API = '/_werkzeuge/bureau/api/termine';
  var SEITE = '/_werkzeuge/bureau/vorschau/zermatt.html', ANKER = 'pakete';
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var KURZ = ['Nov', 'Dez', 'Jan', 'Feb', 'Mär', 'Apr'];
  var L = null, liste = [], H = null, vorschauBreite = 'rechner';

  function kopie(x) { return JSON.parse(JSON.stringify(x)); }
  function basis() { return L ? (L.entwurf || L.stand) : []; }
  function gleich(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function nach(id, l) { return (l || []).find(function (t) { return t.id === id; }); }
  function datum(d) { var p = String(d || '').split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function gibt(d) { var p = String(d || '').split('-'); return p.length === 3 && !isNaN(datum(d).getTime()) && datum(d).getMonth() + 1 === +p[1]; }
  /* Der Zeitraum, wie die Website ihn schreibt (termine.py › zeitraum): «3. bis 11. April 2027», «1. November bis 6. Dezember 2026» */
  function zeitraum(t) {
    if (!gibt(t.von) || !gibt(t.bis)) return 'Zeitraum unvollständig';
    var a = datum(t.von), b = datum(t.bis), M = MONATE;
    if (a.getFullYear() !== b.getFullYear()) return a.getDate() + '. ' + M[a.getMonth()] + ' ' + a.getFullYear() + ' bis ' + b.getDate() + '. ' + M[b.getMonth()] + ' ' + b.getFullYear();
    if (a.getMonth() !== b.getMonth()) return a.getDate() + '. ' + M[a.getMonth()] + ' bis ' + b.getDate() + '. ' + M[b.getMonth()] + ' ' + b.getFullYear();
    if (a.getDate() !== b.getDate()) return a.getDate() + '. bis ' + b.getDate() + '. ' + M[b.getMonth()] + ' ' + b.getFullYear();
    return a.getDate() + '. ' + M[a.getMonth()] + ' ' + a.getFullYear();
  }
  function tage(t) { return gibt(t.von) && gibt(t.bis) ? Math.round((datum(t.bis) - datum(t.von)) / 864e5) + 1 : 0; }
  function wer(t) { return (t.name || 'Name fehlt') + ' · ' + zeitraum(t); }
  function saison() { return L && L.saison ? L.saison : ['2026-11-01', '2027-04-30']; }

  async function ruf(methode, weg_, daten) {
    var r;
    try {
      var vorab = methode === 'GET' && !daten && !weg_ && window.__vorab && window.__vorab[API]; if (vorab) delete window.__vorab[API];   // beim Laden der Seite schon geholt (index.html)
      r = await (vorab || fetch(API + (weg_ ? '/' + weg_ : ''), { method: methode, headers: daten ? { 'Content-Type': 'application/json' } : {}, body: daten ? JSON.stringify(daten) : undefined, cache: 'no-store' }));
    } catch (e) { throw { fehler: 'NETZ · Der Server des Werkzeugs antwortet nicht. Ihre Eingaben bleiben stehen.', stichwort: 'netz' }; }
    var j = {}; try { j = await r.json(); } catch (e) { /* leer */ }
    if (!r.ok) { j.status = r.status; throw j; }
    return j;
  }
  function uebernehmen(neu, eingabenBehalten) {
    if (!neu || !Array.isArray(neu.stand)) return;   /* eine Antwort ohne Stand (z. B. ein Prüfprogramm, das jede Anfrage mit {ok:true} beantwortet) ändert nichts */
    L = neu;
    if (!eingabenBehalten) liste = kopie(basis());
  }
  /* Was geändert ist: zwischen zwei Listen, je Paket, mit den Feldern, die sich unterscheiden (der Text des Zeitraums folgt den Tagen) */
  function kern(t) { return { id: t.id, name: t.name, von: t.von, bis: t.bis }; }
  function unterschiede(alt, neu) {
    var aus = [];
    neu.forEach(function (t) {
      var a = nach(t.id, alt);
      if (!a) aus.push({ art: 'neu', t: t });
      else if (!gleich(kern(a), kern(t))) aus.push({ art: 'geaendert', t: t, a: a });
    });
    alt.forEach(function (a) { if (!nach(a.id, neu)) aus.push({ art: 'weg', t: a }); });
    return aus;
  }
  function zeile(u) {
    if (u.art === 'neu') return 'neues Paket ' + wer(u.t);
    if (u.art === 'weg') return 'von der Seite genommen: ' + (u.t.name || '') + ', ' + zeitraum(u.t);
    var d = [];
    if (u.a.name !== u.t.name) d.push('«' + u.a.name + '» heisst «' + u.t.name + '»');
    if (u.a.von !== u.t.von || u.a.bis !== u.t.bis) d.push('«' + zeitraum(u.a) + '» wird «' + zeitraum(u.t) + '»');
    return (u.t.name || u.a.name) + ': ' + d.join(', ');
  }
  function offen() { return L ? unterschiede(basis(), sortiert(liste)).length : 0; }
  function sortiert(l) { return l.slice().sort(function (a, b) { return (a.von || '').localeCompare(b.von || '') || (a.bis || '').localeCompare(b.bis || ''); }); }   // wie auf der Website: nach erstem, dann letztem Tag
  function istHier() { return H && H.ansicht() === 'e:termine' && document.querySelector('#ws-mitte[data-ws-ansicht="e:termine"]'); }

  async function speichern() {
    try {
      var a = await ruf('POST', 'speichern', { termine: sortiert(liste).map(kern), erwartet: L.kennung });
      uebernehmen(a, false);
      if (a.nichts) { H && H.melde(a.meldung); } else {
        var n = unterschiede(a.vorher, basis()), k = H.quit('Gespeichert', 'Pakete · ' + zeile(n[0] || { art: 'neu', t: basis()[0] || {} }) + (n.length > 1 ? ' und ' + H.mz(n.length - 1, 'weitere Änderung', 'weitere Änderungen') : ''), [
          H.taste('Vorher/nachher ansehen', function () { k.remove(); H.geh('e:termine').then(function () { var v = document.getElementById('cu-tv'); if (v) v.scrollIntoView({ block: 'start' }); }); }),
          H.taste('Rückgängig', function () { k.remove(); rueckgaengig(a.vorher); })], { 'data-ws-quittung': n.length, 'data-cu-termine': 'gespeichert' });
        setTimeout(function () { if (k.isConnected) k.remove(); }, 9000);
      }
      if (istHier()) zeichne(document.getElementById('ws-mitte'), H);
      return true;
    } catch (e) {
      if (e.status === 409) { return konflikt(); }
      H.fehler(e);
      return false;
    }
  }
  async function rueckgaengig(vorher) {
    try { uebernehmen(await ruf('POST', 'speichern', { termine: vorher.map(kern), erwartet: L.kennung }), false); H.melde('Rückgängig gemacht', { mehr: 'Die Pakete sind wie vor diesem Speichern.' }); }
    catch (e) { if (e.status === 409) { await neuLaden(true); H.melde('Inzwischen hat jemand anderes gespeichert.', { stichwort: 'konflikt' }); } else H.fehler(e); }
    H.neu(); if (istHier()) zeichne(document.getElementById('ws-mitte'), H);
  }
  async function neuLaden(behalten) { uebernehmen(await ruf('GET', ''), behalten); }
  function konflikt() {
    return neuLaden(true).then(function () {
      return new Promise(function (fertig) {
        H.fenster('Zwei haben', 'gleichzeitig geändert.', H.el('div', { class: 'ws-form' },
          H.el('p', {}, 'In einem anderen Fenster wurden die Pakete inzwischen gespeichert. Ihre Eingaben sind nicht verloren und nichts wurde überschrieben.'),
          H.el('p', {}, 'Speichern Sie, gilt Ihre Liste, so wie sie hier steht.')), [
          { text: 'Meine Eingaben verwerfen', tun: function (zu) { zu(); liste = kopie(basis()); H.neu(); if (istHier()) zeichne(document.getElementById('ws-mitte'), H); fertig(false); } },
          { text: 'Meine Eingaben speichern', haupt: true, tun: function (zu) { zu(); speichern().then(fertig); } }], { name: 'konflikt' });
      });
    });
  }

  /* ---------- Zeichnen */
  /* Das Bild eines Pakets: sein Balken im Saisonkalender, wie die Seite «Zermatt» ihn zeigt (Monate November bis April, der Balken über seine Tage) */
  function balken(t) {
    var s = saison(), t0 = datum(s[0]), n = Math.round((datum(s[1]) - t0) / 864e5) + 1;
    var monate = KURZ.map(function (k, i) { var d = new Date(2026, 10 + i, 1); return '<span style="left:' + ((d - t0) / 864e5 / n * 100).toFixed(2) + '%">' + k + '</span>'; }).join('');
    var bar = '';
    if (gibt(t.von) && gibt(t.bis) && datum(t.bis) >= datum(t.von)) {
      var x0 = Math.max(0, (datum(t.von) - t0) / 864e5 / n * 100), x1 = Math.min(100, ((datum(t.bis) - t0) / 864e5 + 1) / n * 100);
      if (x1 > x0) bar = '<i class="cu-kal__b" style="left:' + x0.toFixed(2) + '%;width:' + (x1 - x0).toFixed(2) + '%"></i>';
    }
    return '<figure class="cu-kal" aria-hidden="true"><div class="cu-kal__m">' + monate + '</div><div class="cu-kal__spur">' + bar + '</div><figcaption class="cu-kal__z">' + (tage(t) ? tage(t) + (tage(t) === 1 ? ' Tag' : ' Tage') : '') + '</figcaption></figure>';
  }
  function feld(label, inhalt, art) { return H.el('label', { class: 'cu-f' + (art ? ' cu-f--' + art : '') }, H.el('span', { class: 'cu-f__l' }, label), inhalt); }
  function auswahlDatum(wert, beiWahl, name) {   // Datum im Stil des Hauses (R21): Tag, Monat, Jahr als Auswahl, nie die des Betriebssystems; nur die Monate und Jahre der Saison
    var p = String(wert || '').split('-'), tg = [], mon = [], jahre = [{ wert: '2026', text: '2026' }, { wert: '2027', text: '2027' }];
    for (var i = 1; i <= 31; i++) tg.push({ wert: ('0' + i).slice(-2), text: i + '.' });
    [11, 12, 1, 2, 3, 4].forEach(function (m) { mon.push({ wert: ('0' + m).slice(-2), text: MONATE[m - 1] }); });
    if (p[1] && !mon.some(function (x) { return x.wert === p[1]; })) mon.push({ wert: p[1], text: MONATE[+p[1] - 1] || p[1] });
    if (p[0] && !jahre.some(function (x) { return x.wert === p[0]; })) jahre.unshift({ wert: p[0], text: p[0] });
    var setze = function (k, w) { p[k] = w; beiWahl(p.join('-')); };
    return H.el('span', { class: 'cu-datum', 'data-cu-tag': name }, H.auswahl(tg, p[2], function (w) { setze(2, w); }, 'Tag'), H.auswahl(mon, p[1], function (w) { setze(1, w); }, 'Monat'), H.auswahl(jahre, p[0], function (w) { setze(0, w); }, 'Jahr'));
  }
  function hoehe(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
  function textFeld(wert, name, label, beiTippen) {   // eine Zeile, die bei langem Text umbricht (nie ein versteckter Anfang); Zeilenumbruch wird zu Leerzeichen
    var i = H.el('textarea', { class: 'cu-zahl cu-ein', name: name, rows: '1', maxlength: '60', autocomplete: 'off', spellcheck: 'false', 'aria-label': label });
    i.value = wert || '';
    i.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
    i.addEventListener('input', function () { if (/\n/.test(i.value)) i.value = i.value.replace(/\s*\n\s*/g, ' '); hoehe(i); beiTippen(i.value); });
    requestAnimationFrame(function () { hoehe(i); });
    return i;
  }
  function pruefeEingabe(t) {
    if (!String(t.name || '').trim()) return 'Wie heisst das Paket? Bitte den Namen eintragen, so wie er bei Zermatt Tourismus steht.';
    if (/[<>{}]/.test(t.name || '')) return 'Spitze und geschweifte Klammern stehen nicht auf der Website.';
    if (!gibt(t.von)) return 'Den ersten Tag gibt es nicht.';
    if (!gibt(t.bis)) return 'Den letzten Tag gibt es nicht.';
    if (datum(t.bis) < datum(t.von)) return 'Der letzte Tag liegt vor dem ersten.';
    var s = saison();
    if (t.von < s[0] || t.bis > s[1]) return 'Der Kalender auf der Seite «Zermatt» zeigt den Winter vom 1. November 2026 bis 30. April 2027; das Paket muss darin liegen.';
    if (liste.some(function (x) { return x !== t && String(x.name || '').trim().toLowerCase() === String(t.name || '').trim().toLowerCase(); })) return 'Ein Paket mit diesem Namen steht schon in der Liste.';
    return '';
  }
  function karte(t) {
    var b = nach(t.id, basis()), neu = !b, geaendert = b && !gleich(kern(b), kern(t));
    var fehler = pruefeEingabe(t);
    var meld = H.el('p', { class: 'cu-t__fehler', role: 'alert', hidden: !fehler }, fehler);
    var kopfZeile = H.el('p', { class: 'cu-t__wann' }, zeitraum(t));
    var bild = H.el('div', { class: 'cu-t__bild', html: balken(t) });
    function neuZeichnen() {
      var f = pruefeEingabe(t); meld.textContent = f; meld.hidden = !f;
      kopfZeile.textContent = zeitraum(t); bild.innerHTML = balken(t);
      var bb = nach(t.id, basis());
      k.classList.toggle('cu-t--offen', !bb || !gleich(kern(bb), kern(t)));
      H.leiste();
    }
    var k = H.el('article', { class: 'cu-t' + (neu || geaendert ? ' cu-t--offen' : ''), 'data-cu-termin': t.id },
      bild,
      H.el('div', { class: 'cu-t__felder' },
        H.el('div', { class: 'cu-t__kopf' }, kopfZeile, neu ? H.el('span', { class: 'cu-t__marke' }, 'Neu') : null),
        H.el('div', { class: 'cu-t__reihe cu-t__reihe--eins' },
          feld('Name des Pakets', textFeld(t.name, 'name', 'Name des Pakets', function (v) { t.name = v; neuZeichnen(); }), 'name')),
        H.el('div', { class: 'cu-t__reihe' },
          feld('Erster Tag', auswahlDatum(t.von, function (w) { t.von = w; neuZeichnen(); }, 'von'), 'datum'),
          feld('Letzter Tag', auswahlDatum(t.bis, function (w) { t.bis = w; neuZeichnen(); }, 'bis'), 'datum')),
        H.el('p', { class: 'cu-t__frei' }, 'Gebucht wird das Paket bei Zermatt Tourismus. Auf der Website steht es mit Namen und Zeitraum im Saisonkalender und am Schluss der Startseite.'),
        meld,
        H.el('div', { class: 'cu-t__kn' },
          b && geaendert ? H.link('Wie gespeichert', function () { liste[liste.indexOf(t)] = kopie(b); zeichne(document.getElementById('ws-mitte'), H); H.leiste(); }) : null,
          H.link(neu ? 'Wieder entfernen' : 'Von der Seite nehmen', function () {
            var nr = liste.indexOf(t); liste.splice(nr, 1); zeichne(document.getElementById('ws-mitte'), H); H.leiste(); H.neu();
            if (!neu) H.melde('Von der Seite genommen', { mehr: (t.name || 'Das Paket') + '. Erst mit «Speichern» im Entwurf; jeder veröffentlichte Stand lässt sich zurückholen.' });
          }, { 'data-cu-weg': t.id }))));
    return k;
  }
  function neuesPaket() {   // Vorschlag: die Woche, die an das zuerst endende Paket anschliesst (innerhalb der Saison), Name leer
    var s = saison(), l = sortiert(liste.length ? liste : basis()).filter(function (x) { return gibt(x.bis); });
    var ende = l.map(function (x) { return x.bis; }).sort()[0];
    var a = ende ? datum(ende) : datum(s[0]); if (ende) a.setDate(a.getDate() + 1);
    if (iso(a) > s[1]) a = datum(s[0]);
    var b = new Date(a); b.setDate(b.getDate() + 6); if (iso(b) > s[1]) b = datum(s[1]);
    var t = { id: 'n' + Date.now().toString(36).slice(-8), name: '', von: iso(a), bis: iso(b) };
    liste.push(t);
    zeichne(document.getElementById('ws-mitte'), H); H.neu();
    var k = document.querySelector('[data-cu-termin="' + t.id + '"]'); if (k) { k.scrollIntoView({ block: 'center' }); k.classList.add('cu-t--leuchtet'); var i = k.querySelector('[name="name"]'); if (i) try { i.focus({ preventScroll: true }); } catch (e) { /* ohne Fokus */ } }
  }

  function vergleich() {   // «Vorher, nachher»: veröffentlicht (durchgestrichen) gegen Entwurf (markiert)
    var u = L.wartet ? unterschiede(L.stand, L.entwurf) : [];
    var box = H.el('section', { class: 'cu-v', id: 'cu-tv' }, H.el('h2', { class: 'wo-zw' }, 'Vorher, ', H.el('em', {}, 'nachher')));
    if (!u.length) {
      box.append(H.el('p', { class: 'cu-leise' }, 'Im Entwurf wartet nichts. Was Sie speichern, steht hier: oben, was jetzt auf der Website steht, darunter, was nach dem Veröffentlichen gilt.'),
        H.el('div', { class: 'cu-v__z cu-v__z--beispiel' }, H.el('span', { class: 'cu-v__mk' }, 'Beispiel'), H.el('s', {}, 'Season End · 12. bis 30. April 2027'), H.el('mark', {}, 'Season End · 5. bis 30. April 2027')));
      return box;
    }
    u.forEach(function (x) {
      box.append(H.el('div', { class: 'cu-v__z', 'data-cu-v': x.art },
        H.el('span', { class: 'cu-v__mk' }, x.art === 'neu' ? 'Neu' : x.art === 'weg' ? 'Entfällt' : 'Geändert'),
        x.art !== 'neu' ? H.el('s', {}, wer(x.a || x.t)) : null,
        x.art !== 'weg' ? H.el('mark', {}, wer(x.t)) : null));
    });
    box.append(H.el('div', { class: 'ws-reihe' }, H.link('Entwurf der Pakete verwerfen', function () {
      H.fenster('Entwurf der Pakete', 'verwerfen?', H.el('p', {}, H.mz(u.length, 'Änderung geht', 'Änderungen gehen') + ' verloren. Die Website bleibt, wie sie ist.'), [
        { text: 'Abbrechen' },
        { text: 'Ja, verwerfen', haupt: true, tun: async function (zu) {
          zu();
          try { var a = await ruf('POST', 'verwerfen', { erwartet: L.kennung }); var vorher = a.vorher; uebernehmen(a, false); H.neu(); zeichne(document.getElementById('ws-mitte'), H);
            var k = H.quit('Entwurf verworfen', 'Die Pakete stehen, wie sie veröffentlicht sind.', [H.taste('Rückgängig', function () { k.remove(); rueckgaengig(vorher); })]);
          } catch (e) { if (e.status === 409) { await neuLaden(true); H.melde('Inzwischen hat jemand anderes gespeichert.', { stichwort: 'konflikt' }); } else H.fehler(e); }
        } }], { name: 'verwerfen' });
    }, { 'data-cu-verwerfen': '1' })));
    return box;
  }
  function verlauf() {   // Frühere Fassungen (R14): Datum, Zahl, Notiz, «In den Entwurf holen», unten immer der ursprüngliche Stand
    var box = H.el('section', { class: 'cu-vl' }, H.el('h2', { class: 'wo-zw' }, 'Frühere ', H.el('em', {}, 'Fassungen')));
    var holen = function (nr, was) {
      return H.taste('In den Entwurf holen', async function () {
        try { uebernehmen(await ruf('POST', 'zurueckholen', { nr: nr, erwartet: L.kennung }), false); H.neu(); zeichne(document.getElementById('ws-mitte'), H);
          H.melde('In den Entwurf geholt', { mehr: was + '. Auf der Website erscheint es erst, wenn Sie veröffentlichen.' });
        } catch (e) { if (e.status === 409) { await neuLaden(true); H.melde('Inzwischen hat jemand anderes gespeichert.', { stichwort: 'konflikt' }); } else H.fehler(e); }
      }, { 'data-cu-holen': String(nr) });
    };
    if (!L.verlauf.length) box.append(H.el('div', { class: 'cu-vl__z cu-vl__z--beispiel' }, H.el('span', { class: 'cu-v__mk' }, 'Beispiel'),
      H.el('b', {}, '20.11.2026, 09:30 Uhr'), H.el('span', {}, 'Veröffentlicht · 6 Pakete · Notiz «Season End verlängert»')));
    L.verlauf.forEach(function (v) {
      box.append(H.el('div', { class: 'cu-vl__z' }, H.el('b', {}, H.zeit(v.zeit)), H.el('span', {}, 'Veröffentlicht · ' + H.mz(v.zahl, 'Paket', 'Pakete') + (v.notiz ? ' · Notiz «' + v.notiz + '»' : '')), holen(v.nr, 'Die Fassung vom ' + H.zeit(v.zeit))));
    });
    box.append(H.el('div', { class: 'cu-vl__z cu-vl__z--ur' }, H.el('b', {}, 'Ursprünglicher Stand'), H.el('span', {}, 'Wie die Website gebaut ist · ' + H.mz(L.ursprung.length, 'Paket', 'Pakete')), holen('ursprung', 'Der ursprüngliche Stand')));
    return box;
  }
  function vorschau() {
    /* ohne Anker laden: ein Anker im Rahmen rollt auch die Seite des Werkzeugs dorthin (Fund 28.10.2026); gerollt wird nur innen */
    var rahmen = H.el('iframe', { class: 'cu-vs__rahmen', src: SEITE, title: 'Vorschau der Seite «Zermatt» mit den Paketen des Entwurfs', loading: 'lazy' });
    rahmen.addEventListener('load', function () {
      /* die Seite setzt Bilder und Auftritt erst nach dem Laden: der Kalender rückt dabei noch, deshalb ein zweites Mal nachrollen */
      var roll = function () { try { var w = rahmen.contentWindow, z = rahmen.contentDocument.getElementById(ANKER); if (z) w.scrollTo({ top: z.getBoundingClientRect().top + w.scrollY, behavior: 'instant' }); } catch (e) { /* ohne Rollen */ } };
      roll(); setTimeout(roll, 400); setTimeout(roll, 1200);
    });
    var huelle = H.el('div', { class: 'cu-vs__huelle', 'data-breite': vorschauBreite }, rahmen);
    var wahl = H.wahl2([{ wert: 'rechner', text: 'Rechner' }, { wert: 'handy', text: 'Handy' }], vorschauBreite, function (w) { vorschauBreite = w; huelle.setAttribute('data-breite', w); }, 'Breite der Vorschau', true);
    return H.el('section', { class: 'cu-vs' }, H.el('h2', { class: 'wo-zw' }, 'So sieht es ', H.el('em', {}, 'auf der Seite aus')),
      H.el('div', { class: 'cu-vs__kopf' }, H.el('p', { class: 'cu-leise' }, L.wartet ? 'Mit den Paketen des Entwurfs. Noch nicht gespeicherte Eingaben erscheinen nach «Speichern».' : 'Der Saisonkalender der Seite «Zermatt», wie er gerade auf der Website steht.'), wahl,
        H.el('a', { class: 'ws-taste', href: SEITE + '#' + ANKER, target: '_blank', rel: 'noopener' }, 'Gross öffnen')), huelle);
  }

  var vsKennung = '';
  function zeichne(ort, h) {
    H = h;
    var m = ort || document.getElementById('ws-mitte');
    var y = window.scrollY;
    /* Neu zeichnen nach einer Eingabe (Neues Paket, Entfernen): nur Liste, Vergleich und Verlauf; die eingebettete Vorschau bleibt stehen, solange
       der Entwurf derselbe ist (ein iframe lädt bei jedem Einsetzen neu, Messung 28.10.2026) */
    if (m.querySelector(':scope > .cu-vs') && m.querySelector(':scope > .cu-liste') && vsKennung === L.kennung) {
      m.querySelector(':scope > .cu-liste').replaceWith(listeBox(h));
      m.querySelector(':scope > .cu-v').replaceWith(vergleich());
      m.querySelector(':scope > .cu-vl').replaceWith(verlauf());
      m.setAttribute('data-cu-termine', String(liste.length));
      return;
    }
    vsKennung = L.kennung;
    m.textContent = '';
    m.append(h.titel('Winter 2026/27', 'Pakete', 'der Saison.', 'Die Pakete des Hauses bei Zermatt Tourismus: Name, erster und letzter Tag. Auf der Seite «Zermatt» stehen sie als Saisonkalender «Der Winter als Startliste.», am Schluss der Startseite als Liste neben dem Knopf zum Buchen.',
      [h.el('button', { class: 'wo-kn wo-kn--gold', type: 'button', 'data-cu-neu': '1', html: '<span>Neues Paket</span><i>' + (window.WO ? WO.ic('plus') : '') + '</i>', onclick: neuesPaket }),
       h.el('a', { class: 'wo-kn', href: SEITE + '#' + ANKER, target: '_blank', rel: 'noopener', html: '<span>Auf der Seite ansehen</span><i>' + (window.WO ? WO.ic('auge') : '') + '</i>' })]));
    var s = sortiert(liste);
    m.append(listeBox(h), vergleich(), vorschau(), verlauf(),
      h.el('p', { class: 'cu-quelle' }, 'Ursprung der Pakete: ' + L.quelle + '. Die Website wird hier nie verändert; veröffentlicht wird in die Probe-Kopie.'));
    if (h.opt && h.opt.halten) window.scrollTo(0, y);
    m.setAttribute('data-cu-termine', String(s.length));
  }
  function listeBox(h) {
    var s = sortiert(liste);
    var box = h.el('section', { class: 'cu-liste', 'aria-label': 'Pakete der Saison' });
    if (!s.length) {
      box.append(h.el('div', { class: 'cu-leer' }, h.el('p', {}, 'Gerade steht kein Paket in der Liste. Mindestens eines bleibt auf der Seite: Saisonkalender und Startseite zeigen die Pakete des Winters. «Wie gespeichert» oder «Neues Paket» füllt die Liste wieder.'),
        h.el('div', { class: 'cu-t cu-t--beispiel' }, h.el('div', { class: 'cu-t__bild', html: balken({ von: '2027-04-12', bis: '2027-04-30' }) }),
          h.el('div', { class: 'cu-t__felder' }, h.el('p', { class: 'cu-t__wann' }, 'Beispiel: 12. bis 30. April 2027'), h.el('p', { class: 'cu-t__frei' }, 'Season End, das Paket zum Saisonende. Mit «Neues Paket» legen Sie eines an.')))));
    }
    s.forEach(function (t) { box.append(karte(t)); });
    return box;
  }

  window.WS_EIGEN = window.WS_EIGEN || {};
  window.WS_EIGEN.termine = {
    name: 'Pakete der Saison', gruppe: 'Das Haus', aufgabe: ['Paket der Saison', 'Ein Paket des Winters eintragen, umbenennen, verschieben oder von der Seite nehmen.'],
    bereit: function () { return ruf('GET', '').then(function (a) { uebernehmen(a, false); }); },
    zeichne: async function (ort, h) { H = h; if (h.opt && h.opt.neuLaden) await neuLaden(true); zeichne(ort, h); },
    offen: offen,
    wartet: function () { return L && L.wartet ? unterschiede(L.stand, L.entwurf).length : 0; },
    speichern: function () { if (!H) return Promise.resolve(false); return speichern(); },
    zeilen: function () { return L && L.wartet ? unterschiede(L.stand, L.entwurf).map(zeile) : []; },
    veroeffentlichen: async function (notiz) {
      var n = this.wartet();
      uebernehmen(await ruf('POST', 'veroeffentlichen', { erwartet: L.kennung, notiz: notiz }), true);
      if (istHier()) zeichne(document.getElementById('ws-mitte'), H);
      return n;
    }
  };
})();

/* Abnahme-Tor 2, 30.10.2026 (S2, K7): Kacheltitel und -unterschriften der Übersicht («Einen Text ändern», «Preis oder Öffnungszeit») ohne einzelnes Wort in der
   letzten Zeile: die letzten zwei Wörter bleiben zusammen (Safari kennt den Umbruch «pretty» noch nicht) */
(function () {
  function fest() {
    document.querySelectorAll(':is(.wo-ag__t, .wo-bk__t) > :is(b, span):not([data-fest]):not(:has(*)), .ws-eintrag__t > b:not([data-fest]), .ws-gt__kopf h2:not([data-fest]):not(:has(*))').forEach(function (b) {
      b.setAttribute('data-fest', '');
      var t = b.textContent.trim(), i = t.lastIndexOf(' '), j = i > 0 ? t.lastIndexOf(' ', i - 1) : -1;
      if (j < 0) { if (i > 0 && b.parentNode.classList.contains('ws-eintrag__t')) b.textContent = t.replace(' ', ' '); return; }   /* Namen aus zwei Wörtern bleiben ganz */
      b.textContent = t.slice(0, j + 1) + t.slice(j + 1).replace(' ', ' ');
    });
  }
  var NAMEN = {};
  try { fetch('/_werkzeuge/bureau/api/bildnamen', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { NAMEN = j || {}; }).catch(function () {}); } catch (e) { /* ohne Namen */ }
  /* Fenster «Foto tauschen»: der Bildtitel steht ganz (das gemeinsame Werkzeug kürzt ihn auf 48 Zeichen mit «…»; der volle steht im title) */
  function ganz() {
    document.querySelectorAll('.ws-fwahl:not([data-ganz])').forEach(function (k) {
      k.setAttribute('data-ganz', '');
      var t = k.querySelector('.ws-fwahl__t'), voll = k.getAttribute('title');
      if (!t) return;
      var text = (voll && /…$/.test(t.textContent)) ? (/^Eigenes Foto · /.test(t.textContent) ? 'Eigenes Foto · ' : '') + voll : t.textContent;
      if (/^[a-z0-9-]+$/.test(text.trim()) && NAMEN[text.trim()]) { text = NAMEN[text.trim()]; k.setAttribute('title', text); }   /* Foto ohne Beschreibung auf der Seite: Name aus dem Bildregister */
      var i = text.lastIndexOf(' ');   /* die letzten zwei Wörter bleiben zusammen: nie ein Wort allein in der letzten Zeile (Kriterium 7) */
      t.textContent = '';   /* die letzten zwei Wörter in einer Zeile, die nicht bricht (auch nicht am Bindestrich) */
      if (i > 0) { var j = text.lastIndexOf(' ', i - 1), ende = document.createElement('span'); ende.style.whiteSpace = 'nowrap'; ende.textContent = text.slice(j + 1); t.append(text.slice(0, j + 1), ende); }
      else t.textContent = text;
    });
  }
  /* Kein «×» als Zählzeichen (K24, Tor 2, 30.10.2026): «Link · 4× auf der Seite» heisst «Link · an 4 Stellen der Seite», «Steht 9× …» heisst «Steht an 9 Stellen …» */
  function ohneX() {
    document.querySelectorAll('.ws-st small, .ws-ang__lage, .ws-hoch, .ws-hoch *').forEach(function (e) {
      if (e.children.length) return;
      var t = e.textContent; if (t.indexOf('×') < 0) return;
      e.textContent = t.replace(/(\d+)× auf der Seite/g, '$1-mal auf der Seite').replace(/Steht (\d+)×/g, 'Steht an $1 Stellen').replace(/(\d+)\s*×\s*(\d+)/g, '$1 auf $2').replace(/(\d+)×/g, '$1-mal');   /* Masse wie in der Werkstatt: «1600 auf 1067» */
    });
  }
  /* Knopf «Website ansehen» im Kopf: zwischen 901 und 1240 px nur der runde Knauf (bureau.css); sein Name bleibt für Vorlesegeräte als aria-label */
  function knaufName() {
    document.querySelectorAll('#ws-kopf a.wo-kn--gold:not([aria-label])').forEach(function (a) { var t = a.textContent.trim(); if (t) a.setAttribute('aria-label', t); });
  }
  var plan = 0;
  /* Lange Werte in Feldern des Stamms (Bildbeschreibung, Google-Titel, Instagram-Link): ein einzeiliges Feld versteckt den Anfang (Kriterium 2). Daneben
     steht ein Textfeld, das umbricht; das Feld des Stamms bleibt (verborgen) die Quelle: Eingaben gehen als «input» an es, Werte, die der Stamm setzt
     («Wie ursprünglich»), erscheinen im Textfeld. Zeilenumbrüche werden zu Leerzeichen, Enter fügt keinen ein. */
  var WERT = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  function langfeld() {
    document.querySelectorAll('input#ws-alt:not([data-lang]), input[id^="ws-gt-t-"]:not([data-lang]), input[id^="ws-ang-"][type="url"]:not([data-lang]), input[id^="ws-ang-"][type="text"]:not([data-lang])').forEach(function (f) {
      f.setAttribute('data-lang', '');
      var t = document.createElement('textarea');
      t.className = 'ws-langfeld'; t.rows = 1; t.spellcheck = false; t.setAttribute('autocomplete', 'off');
      var lb = f.id && document.querySelector('label[for="' + CSS.escape(f.id) + '"]');
      if (lb) { if (!lb.id) lb.id = 'lb-' + f.id; t.setAttribute('aria-labelledby', lb.id); }
      t.value = f.value;
      var hoch = function () { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; };
      var spiegel = function () { t.disabled = f.disabled; t.setAttribute('aria-invalid', f.getAttribute('aria-invalid') || 'false'); };
      Object.defineProperty(f, 'value', { configurable: true, get: function () { return WERT.get.call(this); }, set: function (v) { WERT.set.call(this, v); if (t.value !== String(v)) { t.value = v; hoch(); } } });
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
      t.addEventListener('input', function () { var v = t.value.replace(/\s*\n\s*/g, ' '); if (v !== t.value) t.value = v; WERT.set.call(f, v); f.dispatchEvent(new Event('input', { bubbles: true })); hoch(); });
      if (window.MutationObserver) new MutationObserver(spiegel).observe(f, { attributes: true, attributeFilter: ['disabled', 'aria-invalid'] });
      spiegel();
      f.style.display = 'none';
      f.after(t);
      requestAnimationFrame(hoch);
      if (document.activeElement === f) t.focus();
    });
  }
  /* Breite Kacheln unter «Häufig gebraucht»: das Foto in der nächsten Stufe der Website (1200 statt 640 px), sonst stand es unscharf vergrössert; fehlt die Stufe, bleibt das kleine */
  function scharf() {
    document.querySelectorAll('.ws-aufgaben > .wo-ag .wo-ag__b img:not([data-scharf])').forEach(function (i) {
      i.setAttribute('data-scharf', '');
      var alt = i.getAttribute('src') || '';
      if (!/-(480|640)\.webp/.test(alt)) return;
      i.addEventListener('error', function () { if (i.getAttribute('src') !== alt) i.setAttribute('src', alt); }, { once: true });
      i.setAttribute('src', alt.replace(/-(480|640)\.webp/, '-1200.webp'));
    });
  }
  /* Angaben des Hauses: der Satz des Stamms nennt Öffnungstage; das Hotel führt hier Telefon, E-Mail, Adresse, Check-in, Check-out und Instagram */
  function angabenSatz() {
    var m = document.querySelector('#ws-mitte[data-ws-ansicht="angaben"]'); if (!m) return;
    m.querySelectorAll('p, span').forEach(function (e) { if (!e.children.length && /^Telefon, E-Mail, Adresse, Öffnungstage und die wichtigsten Links\./.test(e.textContent)) e.textContent = e.textContent.replace(/^Telefon, E-Mail, Adresse, Öffnungstage und die wichtigsten Links\./, 'Telefon und E-Mail der Rezeption, Adresse, Check-in und Check-out und der Link zu Instagram.'); });
  }
  /* Fotos der Foto-Gruppen eines Bereichs sofort laden und malen (WebKit malte spät geladene Bilder unter einem offenen Fenster nicht; Lösung wie in Anfragen & Chat) */
  function sofort() {
    document.querySelectorAll('.ws-fotos .ws-foto img:not([data-sofort])').forEach(function (i) {
      i.setAttribute('data-sofort', ''); i.loading = 'eager'; i.decoding = 'sync';
    });
  }
  /* «Ändern» unter dem Namen eines Eintrags (Angaben je Suite) als Zeichen der Kachel (CSS ::after), damit die letzte Textzeile der Name bleibt (Kriterium 7; Lösung aus dem Vorbild) */
  function aendernZeichen() {
    document.querySelectorAll('.ws-eintrag__auf:not([data-text])').forEach(function (e) { var t = e.textContent.trim(); if (!t) return; e.setAttribute('data-text', t); e.textContent = ''; });
  }
  /* Adressen im Text des Impressums («https://www.google.de/intl/de/policies/privacy»): in der schmalen Stellenliste brechen sie an Schrägstrich und Punkt um,
     nie mitten im Wort (Fund der schnellen Prüfung 08.11.2026: «privacy», «Datenschutzerklaerung» ohne Trennstrich geteilt) */
  function adressenUmbruch() {
    document.querySelectorAll('#ws-gruppen .ws-st span:not([data-wbr])').forEach(function (s) {
      s.setAttribute('data-wbr', '');
      if (s.children.length || !/https?:\/\//.test(s.textContent)) return;
      var f = document.createDocumentFragment();
      s.textContent.split(/(https?:\/\/\S+)/).forEach(function (teil, i) {
        if (i % 2 === 0) { if (teil) f.append(teil); return; }
        teil.split(/(?<=[\/.\-])/).forEach(function (st, j) { if (j) f.append(document.createElement('wbr')); f.append(st); });
      });
      s.textContent = ''; s.append(f);
    });
  }
  function alles() { plan = 0; sofort(); angabenSatz(); fest(); aendernZeichen(); adressenUmbruch(); ganz(); ohneX(); knaufName(); langfeld(); scharf(); }
  if (window.MutationObserver) new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(alles); }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
