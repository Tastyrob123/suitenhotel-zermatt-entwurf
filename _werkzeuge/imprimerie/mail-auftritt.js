/* mail-auftritt.js · Newsletter & E-Mail Drucksachen & Feed: ruhige Auftritte beim Scrollen am Handy (Robert 09.11.2026: «diese Animationen,
   dieses luxuriöse, edle, überall»). Haltung und Kurven wie die Bewegung der übrigen Werkzeuge des Hauses (oberflaeche/bewegung.js):
   Abend statt Feder, 1,25 s weich auslaufend, gestaffelt um 85 ms, nur translate (das Neigen der Mail mit transform bleibt unberührt;
   kein scale: ein verkleinerter Knopf verschiebt die gemessene Mitte seiner Schrift, Messlauf text-mitte 09.11.2026).
   Nur unter 981 px, wo die drei Spalten untereinander stehen und die Seite selbst scrollt; am Bildschirm hat jede Spalte ihren eigenen Lauf.
   Nie unsichtbar: was man beim Öffnen schon sieht, steht still; was unter dem Rand liegt, wartet dort deckend und nur ein Stück tiefer.
   prefers-reduced-motion: nichts bewegt sich. */
(function () {
  'use strict';
  if (window.__mlAuftritt) return; window.__mlAuftritt = true;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var schmal = matchMedia('(max-width:980px)');

  var CSS = ''
    + '@keyframes ml-af-hoch{from{translate:0 38px}}'
    + '@media (max-width:980px){'
    + '[data-ml-af]:not(.ml-af-da){translate:0 38px}'
    + '[data-ml-af].ml-af-da{animation:ml-af-hoch 1.25s cubic-bezier(.19,1,.22,1) backwards;animation-delay:calc(var(--ml-af-i,0) * 85ms)}'
    + '}'
    + '@media (prefers-reduced-motion:reduce){[data-ml-af]{animation:none!important;translate:none!important}}';

  /* Was auftritt: die Stücke der linken Spalte (Kapitel, Vorlagen, Teile), die Bühne mit der Mail, rechts die Bausteine und jedes Feld */
  var SEL = '.ml-links > *, .ml-buehne, .ml-rechts > h3, .ml-einfuegen, .ml-felder > *';
  var io = null;

  function beobachter() {
    return new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;   /* noch unter dem Rand; übersprungen (Sprung nach unten) kommt gleich an seinen Platz */
        io.unobserve(e.target);
        e.target.style.setProperty('--ml-af-i', Math.min(k++, 5));
        e.target.classList.add('ml-af-da');
      });
    }, { rootMargin: '0px 0px -6% 0px' });
  }

  function markiere() {
    if (!schmal.matches) return;
    var H = innerHeight;
    document.querySelectorAll(SEL).forEach(function (el) {
      if (el.hasAttribute('data-ml-af') || el.hidden || !el.offsetHeight) return;
      if (el.getBoundingClientRect().top < H) return;   /* schon zu sehen: steht still */
      el.setAttribute('data-ml-af', '');
      (io || (io = beobachter())).observe(el);
    });
  }

  /* Sprung über ein Stück hinweg (Anker, Ende-Taste): der Beobachter meldet es nicht, also beim Scrollen nachsehen, was schon darüber liegt */
  var nach = 0;
  addEventListener('scroll', function () {
    if (nach) return;
    nach = requestAnimationFrame(function () {
      nach = 0;
      document.querySelectorAll('[data-ml-af]:not(.ml-af-da)').forEach(function (el) {
        if (el.getBoundingClientRect().bottom < 0) { if (io) io.unobserve(el); el.classList.add('ml-af-da'); }
      });
    });
  }, { passive: true });

  function los() {
    var st = document.createElement('style'); st.id = 'ml-auftritt'; st.textContent = CSS; document.head.appendChild(st);
    markiere();
    /* die Felder rechts setzt mail.js nach dem Laden der Vorlage: einmal nachsehen, sobald alles steht */
    addEventListener('load', function () { requestAnimationFrame(markiere); setTimeout(markiere, 600); });
    /* Am Handy stehen Bausteine und Einstellungen gleich unter der linken Spalte (P18): sobald mail.js die Vorlagen gesetzt hat und die Seite wächst,
       rutschen sie unter den Rand. In den ersten Sekunden bei jeder Grössenänderung nachsehen, damit sie auch bei langsamem Laden auftreten. */
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () { requestAnimationFrame(markiere); });
      ro.observe(document.body); setTimeout(function () { ro.disconnect(); }, 4000);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
