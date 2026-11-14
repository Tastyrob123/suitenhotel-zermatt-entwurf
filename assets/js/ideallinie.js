/* Suitenhotel Zurbriggen, Zermatt · «Die Ideallinie» (Station 07, 18.10.2026). Nur transform, nativer Scroll, nichts springt.
   1 Titelzeilen aus dem Schlitz, Stücke steigen deckend, .da beim Ankommen (Handschrift, nach proben/bewegung.js)
   2 Die Linie je Fahrt: durch jede Torflagge, waagrecht nur zwischen zwei Toren (in der Lücke), Ecken weich; fährt beim Scrollen voraus
   3 Sprünge (stehende Bilder), Suiten-Wechsel, Haus-Finder, Fenster (Buchen, Frühstück, Abendessen), Streckenplan, Kopf weicht */
(function () {
  'use strict';
  var D = document, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1 Titelzeilen: nach dem echten Umbruch in Zeilen teilen */
  function zeilen(el) {
    if (!el.dataset.orig) el.dataset.orig = el.innerHTML; else el.innerHTML = el.dataset.orig;
    var woerter = [];
    (function teile(knoten, hulle) {
      Array.prototype.slice.call(knoten.childNodes).forEach(function (n) {
        if (n.nodeType === 3) n.textContent.split(/([ \t\n\r]+)/).forEach(function (t) {
          if (!t) return; if (/^[ \t\n\r]+$/.test(t)) { woerter.push(null); return; }
          var s = D.createElement(hulle || 'span'); s.className = 'w'; s.textContent = t; woerter.push(s);
        });
        else if (n.nodeType === 1) { if (n.tagName === 'BR') { woerter.push('br'); return; } teile(n, n.tagName.toLowerCase()); }
      });
    })(el, null);
    el.innerHTML = '';
    woerter.forEach(function (w) { el.appendChild(w === null ? D.createTextNode(' ') : (w === 'br' ? D.createElement('br') : w)); });
    var reihen = [], oben = null;
    Array.prototype.forEach.call(el.querySelectorAll('.w'), function (w) { var t = w.offsetTop; if (oben === null || Math.abs(t - oben) > 4) { reihen.push([]); oben = t; } reihen[reihen.length - 1].push(w); });
    el.innerHTML = '';
    reihen.forEach(function (r, i) {
      var z = D.createElement('span'); z.className = 'zl'; var s = D.createElement('span'); s.style.setProperty('--z', i);
      r.forEach(function (w, j) { if (j) s.appendChild(D.createTextNode(' ')); s.appendChild(w); }); z.appendChild(s); el.appendChild(z);
    });
  }
  var titel = D.querySelectorAll('[data-zeilen]');
  if (!ruhig) {
    (D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(function () { Array.prototype.forEach.call(titel, zeilen); alleLinien(); });
    var bw = innerWidth, t0; addEventListener('resize', function () { if (innerWidth === bw) return; bw = innerWidth; clearTimeout(t0); t0 = setTimeout(function () { Array.prototype.forEach.call(titel, zeilen); alleLinien(); }, 180); });
  }
  var gruppe = new Map();
  Array.prototype.forEach.call(D.querySelectorAll('[data-s]'), function (el) { var g = el.parentElement, n = gruppe.get(g) || 0; gruppe.set(g, n + 1); if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', Math.min(n, 5)); });
  var ziele = D.querySelectorAll('[data-s],[data-zeilen],[data-auftritt]');
  if (ruhig || !('IntersectionObserver' in window)) Array.prototype.forEach.call(ziele, function (e) { e.classList.add('da'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(ziele, function (e) { io.observe(e); });
  }

  /* 2 Die Linie je Fahrt */
  var fahrten = Array.prototype.slice.call(D.querySelectorAll('[data-fahrt]'));
  function zeichne(fahrt) {
    var svg = fahrt.querySelector('.linie svg'), pfad = svg.querySelector('path');
    var r0 = fahrt.getBoundingClientRect(), w = r0.width, h = r0.height, flaggen = [], box = [];
    fahrt.querySelectorAll('.tor').forEach(function (t) {
      var f = t.querySelector('.flagge'); if (!f) return; var fr = f.getBoundingClientRect(), r = t.getBoundingClientRect();
      flaggen.push([fr.left - r0.left + 6, fr.top - r0.top + 6]); box.push([r.top - r0.top, r.bottom - r0.top]);
    });
    if (!flaggen.length) { pfad.setAttribute('d', ''); return; }
    var mitte = w / 2, schmal = innerWidth <= 860, x0 = schmal ? flaggen[0][0] : mitte;
    var pts = [[x0, 0], [x0, 24], [flaggen[0][0], 24]];
    flaggen.forEach(function (f, i) {
      pts.push([f[0], f[1]]);
      var gy = i < flaggen.length - 1 ? (box[i][1] + box[i + 1][0]) / 2 : h - 24;
      var nx = i < flaggen.length - 1 ? flaggen[i + 1][0] : (schmal ? f[0] : mitte);
      pts.push([f[0], gy]); pts.push([nx, gy]);
    });
    pts.push([schmal ? flaggen[flaggen.length - 1][0] : mitte, h]);
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], c = pts[i + 1];
      if (!c) { d += ' L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1); break; }
      var r = Math.min(240, Math.abs(b[0] - a[0]) / 2 || 240, Math.abs(b[1] - a[1]) / 2 || 240, Math.abs(c[0] - b[0]) / 2 || 240, Math.abs(c[1] - b[1]) / 2 || 240);
      var ax = b[0] - Math.sign(b[0] - a[0]) * r, ay = b[1] - Math.sign(b[1] - a[1]) * r, cx = b[0] + Math.sign(c[0] - b[0]) * r, cy = b[1] + Math.sign(c[1] - b[1]) * r;
      d += ' L' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' Q' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1);
    }
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); pfad.setAttribute('d', d);
  }
  function alleLinien() { fahrten.forEach(zeichne); decken(); }
  var tick = false;
  function decken() {
    if (ruhig) return;
    var vh = innerHeight;
    fahrten.forEach(function (f) {
      var r = f.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) { if (r.bottom < 0) f.querySelector('.linie__decke').style.transform = 'translateY(' + r.height + 'px)'; return; }
      var frei = Math.max(0, Math.min(r.height, vh * .62 - r.top));
      f.querySelector('.linie__decke').style.transform = 'translateY(' + frei + 'px)';
    });
    tick = false;
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(decken); } }, { passive: true });
  addEventListener('load', alleLinien);
  if (ruhig) addEventListener('load', function () { fahrten.forEach(zeichne); });
  if ('ResizeObserver' in window) fahrten.forEach(function (f) { var ro = new ResizeObserver(function () { zeichne(f); }); ro.observe(f); });

  /* 3a Sprünge: das feste Bild ist nur sichtbar, solange sein Sprung im Blick ist */
  var sio = new IntersectionObserver(function (es) { es.forEach(function (en) { en.target.classList.toggle('an', en.isIntersecting); }); }, { rootMargin: '10% 0px 10% 0px' });
  D.querySelectorAll('.sprung').forEach(function (s) { sio.observe(s); });

  /* 3b Suiten: Name antippen, das Foto fährt von unten über das alte */
  D.querySelectorAll('[data-suiten]').forEach(function (box) {
    var knoepfe = box.querySelectorAll('.reihe button'), w = box.querySelector('.wechsel');
    knoepfe.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-pressed') === 'true') return;
        knoepfe.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var fig = D.createElement('figure'); fig.className = 'neu';
        var im = new Image(); im.alt = b.dataset.alt; im.src = b.dataset.src; im.srcset = b.dataset.srcset; im.sizes = '(max-width:860px) 100vw, 640px';
        var cap = D.createElement('figcaption'); cap.textContent = b.dataset.name; fig.appendChild(im); fig.appendChild(cap);
        var los = function () { w.appendChild(fig); requestAnimationFrame(function () { requestAnimationFrame(function () { fig.classList.add('an'); }); });
          setTimeout(function () { var alle = w.querySelectorAll('figure'); for (var i = 0; i < alle.length - 1; i++) alle[i].remove(); fig.className = ''; }, ruhig ? 0 : 950); };
        if (im.complete) los(); else { im.onload = los; im.onerror = los; }
      });
    });
  });

  /* 3c Haus-Finder: eine Regel trifft nur, wenn alle ihre Fragen so beantwortet sind */
  D.querySelectorAll('[data-finder]').forEach(function (f) {
    var wahl = {}, ziel = f.querySelector('.treffer'), daten = JSON.parse(f.querySelector('script[type="application/json"]').textContent);
    var zeige = function () {
      var t = daten.regeln.find(function (r) { return Object.keys(r.wenn).every(function (k) { return wahl[k] && r.wenn[k].indexOf(wahl[k]) >= 0; }); }) || daten.regeln[0];
      var h = daten.haeuser[t.haus]; var im = ziel.querySelector('img'); im.src = h.bild; im.alt = h.name;
      ziel.querySelector('b').textContent = h.name; ziel.querySelector('p').textContent = t.satz; var a = ziel.querySelector('a'); a.href = h.link; a.querySelector('span').textContent = h.knopf;
      if (/^https?:/.test(h.link)) { a.target = '_blank'; a.rel = 'noopener'; } else { a.removeAttribute('target'); }
    };
    f.querySelectorAll('.schalter').forEach(function (s) { s.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () {
      s.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); wahl[s.dataset.frage] = b.dataset.wert; zeige(); }); }); });
  });

  /* 3d Fenster und Streckenplan */
  D.querySelectorAll('[data-oeffne]').forEach(function (k) {
    k.addEventListener('click', function (ev) {
      var d = D.getElementById(k.dataset.oeffne); if (!d) return; ev.preventDefault();
      var quelle = k.closest('form');
      if (quelle && d.id === 'buchen') ['an', 'ab', 'pers'].forEach(function (n) { var q = quelle.querySelector('[name="' + n + '"]'), z = d.querySelector('[name="' + n + '"]'); if (q && z && q.value) z.value = q.value; });
      d.showModal(); d.dispatchEvent(new Event('auf'));
    });
  });
  D.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.querySelectorAll('[data-zu]').forEach(function (z) { z.addEventListener('click', function () { d.close(); }); });
    d.querySelectorAll('a[href^="#"],a[href^="index.html#"]').forEach(function (a) { a.addEventListener('click', function () { d.close(); }); });
  });
  D.querySelectorAll('form[data-studie]').forEach(function (fm) { fm.addEventListener('submit', function (e) { e.preventDefault(); fm.classList.add('gesendet'); }); });

  /* 3e Zimmer-Finder im Buchen-Fenster: Personen → die passenden Suiten; Buchung beim Haus über Mews */
  var buchen = D.getElementById('buchen');
  if (buchen) {
    var liste = buchen.querySelector('.passend'), pers = buchen.querySelector('[name="pers"]'), alle = JSON.parse(buchen.querySelector('script[type="application/json"]').textContent), mews = buchen.dataset.mews;
    var neu = function () {
      var p = +pers.value || 2, html = '';
      alle.filter(function (z) { return !z.max || z.max >= p; }).forEach(function (z) {
        html += '<a href="' + mews + '" target="_blank" rel="noopener"><img src="' + z.bild + '" alt="" loading="lazy"><span><b>' + z.name + '</b><small>' + z.daten + '</small></span>' + (z.nr ? '<span class="nr">' + z.nr + '</span>' : '<span></span>') + '</a>';
      });
      liste.innerHTML = html;
    };
    pers.addEventListener('change', neu); buchen.addEventListener('auf', neu); neu();
  }

  /* 3f Kopf: weicht beim Runterscrollen, kommt beim Hochscrollen zurück */
  var kopf = D.querySelector('[data-kopf]'), letzt = scrollY, kt = false;
  if (kopf) addEventListener('scroll', function () { if (kt) return; kt = true; requestAnimationFrame(function () { var y = scrollY; if (y > letzt + 2 && y > 140) kopf.classList.add('weg'); else if (y < letzt - 2) kopf.classList.remove('weg'); letzt = y; kt = false; }); }, { passive: true });
})();
