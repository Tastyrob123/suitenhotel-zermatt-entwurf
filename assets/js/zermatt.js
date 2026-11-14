/* Suitenhotel Zurbriggen, Zermatt · Designstudie (Station 07). Kein Eingriff ins Scrollen, nur transform, nichts springt.
   Teile: Auftritte (.da), Fenster (sichtbar nur im Blick), Startnummern, Bildgruppe (FLIP), Band zum Blättern, Haus-Finder, Fenster-Dialoge. */
(function () {
  'use strict';
  var ruhe = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Auftritte: Abschnitte, Bilder und Zeilen bekommen .da, sobald sie den Bildschirmrand erreichen; einmal, nie zurück */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('da'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('section,[data-zug],.zoom,[data-r],.linie,.strich').forEach(function (el) { io.observe(el); });
  if (ruhe) document.querySelectorAll('section,[data-zug],.zoom,[data-r]').forEach(function (el) { el.classList.add('da'); });

  /* Fenster: das feste Bild ist nur sichtbar, solange sein Fenster im Blick ist (zwei Fenster überdecken sich nie) */
  var fio = new IntersectionObserver(function (es) {
    es.forEach(function (en) { en.target.classList.toggle('an', en.isIntersecting); });
  }, { rootMargin: '10% 0px 10% 0px' });
  document.querySelectorAll('.bruch').forEach(function (b) { fio.observe(b); });

  /* Startnummern: Antippen zeigt das Foto der Suite; das neue fährt von unten über das alte, das alte bleibt deckend */
  document.querySelectorAll('[data-suiten]').forEach(function (box) {
    var bibs = box.querySelectorAll('.bib'), buehne = box.querySelector('.buehne'), info = box.querySelector('.buehne__info');
    bibs.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-pressed') === 'true') return;
        bibs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var fig = document.createElement('figure'); fig.className = 'neu';
        var im = new Image(); im.alt = b.dataset.alt; im.src = b.dataset.src; im.srcset = b.dataset.srcset; im.sizes = '(max-width:900px) 100vw, 1320px';
        fig.appendChild(im);
        var los = function () {
          buehne.insertBefore(fig, info);
          requestAnimationFrame(function () { requestAnimationFrame(function () { fig.classList.add('an'); }); });
          setTimeout(function () { var alle = buehne.querySelectorAll('figure'); for (var i = 0; i < alle.length - 1; i++) alle[i].remove(); fig.className = ''; }, ruhe ? 0 : 950);
          info.innerHTML = '<span>' + b.dataset.name + '</span><span>' + b.dataset.daten + '</span>';
        };
        if (im.complete) los(); else { im.onload = los; im.onerror = los; }
      });
    });
  });

  /* Bildgruppe: ein kleines Bild fährt an die Stelle des grossen (FLIP, 880 ms, nur transform), das grosse nimmt seinen Platz */
  document.querySelectorAll('[data-gruppe]').forEach(function (g) {
    var knoepfe = g.querySelectorAll('button');
    knoepfe.forEach(function (k, i) {
      if (i === 0) return;
      k.addEventListener('click', function () {
        var gross = knoepfe[0], a = gross.getBoundingClientRect(), b = k.getBoundingClientRect();
        var ig = gross.querySelector('img'), ik = k.querySelector('img');
        var tausch = function (x, y) { ['src', 'srcset', 'alt'].forEach(function (p) { var t = x.getAttribute(p); x.setAttribute(p, y.getAttribute(p)); y.setAttribute(p, t); }); };
        tausch(ig, ik);
        if (ruhe) return;
        /* das neue grosse Bild startet an der Stelle des kleinen, das neue kleine an der Stelle des grossen */
        ig.style.transformOrigin = '0 0'; ik.style.transformOrigin = '0 0';
        ig.style.transform = 'translate(' + (b.left - a.left) + 'px,' + (b.top - a.top) + 'px) scale(' + (b.width / a.width) + ',' + (b.height / a.height) + ')';
        ik.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + (a.width / b.width) + ',' + (a.height / b.height) + ')';
        gross.style.overflow = k.style.overflow = 'visible'; gross.style.zIndex = 2;
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          [ig, ik].forEach(function (im) { im.style.transition = 'transform 880ms cubic-bezier(.36,0,.1,1)'; im.style.transform = 'none'; });
          setTimeout(function () { [ig, ik].forEach(function (im) { im.style.transition = ''; im.style.transform = ''; im.style.transformOrigin = ''; }); gross.style.overflow = k.style.overflow = ''; gross.style.zIndex = ''; }, 900);
        }); });
      });
    });
  });

  /* Band zum Blättern: Pfeile holen eine Karte, Laufbalken folgt dem Band */
  document.querySelectorAll('[data-band]').forEach(function (w) {
    var band = w.querySelector('.band'), balken = w.querySelector('.laufbalken i');
    var schritt = function () { var k = band.querySelector('.strecke'); return k ? k.getBoundingClientRect().width + 16 : 300; };
    w.querySelectorAll('[data-schritt]').forEach(function (p) {
      p.addEventListener('click', function () { band.scrollBy({ left: schritt() * (+p.dataset.schritt), behavior: ruhe ? 'auto' : 'smooth' }); });
    });
    var nach = function () { var max = band.scrollWidth - band.clientWidth; var t = max > 0 ? band.scrollLeft / max : 0; if (balken) balken.style.setProperty('--x', (t * 233) + '%'); };
    band.addEventListener('scroll', nach, { passive: true }); nach();
  });

  /* Haus-Finder der Familie: drei Fragen, die Antwort tauscht an derselben Stelle, die Höhe bleibt */
  document.querySelectorAll('[data-finder]').forEach(function (f) {
    var wahl = {}, ziel = f.querySelector('.treffer'), daten = JSON.parse(f.querySelector('script[type="application/json"]').textContent);
    var zeige = function () {
      var t = daten.regeln.find(function (r) { return Object.keys(r.wenn).every(function (k) { return wahl[k] && r.wenn[k].indexOf(wahl[k]) >= 0; }); }) || daten.regeln[0];
      var h = daten.haeuser[t.haus];
      ziel.querySelector('img').src = h.bild; ziel.querySelector('img').alt = h.name;
      ziel.querySelector('b').textContent = h.name; ziel.querySelector('p').textContent = t.satz;
      var a = ziel.querySelector('a'); a.href = h.link; a.querySelector('span').textContent = h.knopf;
    };
    f.querySelectorAll('.schalter').forEach(function (s) {
      s.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          s.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          wahl[s.dataset.frage] = b.dataset.wert; zeige();
        });
      });
    });
  });

  /* Fenster (Dialoge): öffnen und schliessen ohne Sprung; Formulare senden in der Designstudie nichts */
  document.querySelectorAll('[data-oeffne]').forEach(function (k) {
    k.addEventListener('click', function (ev) {
      var d = document.getElementById(k.dataset.oeffne); if (!d) return; ev.preventDefault();
      var quelle = k.closest('form,.buchung');
      if (quelle && d.id === 'buchen') ['an', 'ab', 'pers'].forEach(function (n) { var q = quelle.querySelector('[name="' + n + '"]'), z = d.querySelector('[name="' + n + '"]'); if (q && z && q.value) z.value = q.value; });
      d.showModal(); d.dispatchEvent(new Event('auf'));
    });
  });
  document.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.querySelectorAll('[data-zu]').forEach(function (z) { z.addEventListener('click', function () { d.close(); }); });
  });
  document.querySelectorAll('form[data-studie]').forEach(function (fm) {
    fm.addEventListener('submit', function (e) { e.preventDefault(); fm.classList.add('gesendet'); });
  });

  /* Zimmer-Finder: Personen → die passenden Suiten, grösste zuerst; Buchung über Mews (Live-Preis folgt mit Zugang des Hauses) */
  var buchen = document.getElementById('buchen');
  if (buchen) {
    var liste = buchen.querySelector('.passend'), pers = buchen.querySelector('[name="pers"]');
    var alle = JSON.parse(buchen.querySelector('script[type="application/json"]').textContent);
    var neu = function () {
      var p = +pers.value || 2, html = '';
      alle.filter(function (z) { return !z.max || z.max >= p; }).forEach(function (z) {
        html += '<a href="' + alle.mews + '" target="_blank" rel="noopener"><img src="' + z.bild + '" alt="" loading="lazy">'
          + '<span><b>' + z.name + '</b><small>' + z.daten + '</small></span>'
          + (z.nr ? '<span class="nr">' + z.nr + '</span>' : '<span></span>') + '</a>';
      });
      liste.innerHTML = html || '<p class="hinweis">Für diese Zahl an Personen hat das Haus keine Suite; die Rezeption hilft gern weiter.</p>';
    };
    alle.mews = buchen.dataset.mews;
    pers.addEventListener('change', neu); buchen.addEventListener('auf', neu); neu();
  }

  /* Menü am Handy */
  var mk = document.querySelector('.leiste__menu'), menu = document.getElementById('menu');
  if (mk && menu) { mk.addEventListener('click', function () { menu.showModal(); }); menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { menu.close(); }); }); }
})();
