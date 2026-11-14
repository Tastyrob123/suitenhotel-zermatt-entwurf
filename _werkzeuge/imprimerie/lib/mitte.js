/* Drucksachen & Feed · Schrift optisch mittig in Knöpfen mit gesperrten Versalien (Zermatt 08.11.2026, Messlauf text-mitte).
   DM Mono hat bei «M», «S», «R», «T», «N» ungleiche Seitenränder; mit Sperrung sitzt die Tinte bis zu einem Pixel neben der Mitte.
   Gemessen wird die Tinte aller Zeichen (Text über canvas measureText, Symbole über getBBox) und über das Polster links/rechts
   ausgeglichen; die Breite des Knopfs bleibt gleich. Aufruf: WOmitte('<selektor>') nach jedem Aufbau; bei anderer Fensterbreite neu. */
(function () {
  const cv = document.createElement('canvas').getContext('2d');
  const offen = new Set();
  function tinte(e) {
    let l = 1e9, r = -1e9;
    const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) {
      if (!n.textContent.trim()) continue;
      const pe = n.parentElement, c = getComputedStyle(pe);
      let t = n.textContent.replace(/\s+/g, ' ').trim(); if (c.textTransform === 'uppercase') t = t.toUpperCase();
      cv.font = `${c.fontStyle} ${c.fontWeight} ${c.fontSize} ${c.fontFamily}`; try { cv.letterSpacing = c.letterSpacing === 'normal' ? '0px' : c.letterSpacing; } catch (x) {}
      const m = cv.measureText(t), rg = document.createRange(); rg.selectNodeContents(n);
      const q = [...rg.getClientRects()].filter(x => x.width > .5); if (q.length !== 1) return null;   // nur einzeilig
      l = Math.min(l, q[0].left - m.actualBoundingBoxLeft); r = Math.max(r, q[0].left + m.actualBoundingBoxRight);
    }
    const c = getComputedStyle(e);
    if (/flex/.test(c.display) && /column/.test(c.flexDirection)) for (const sv of e.querySelectorAll('svg')) {
      try { const bb = sv.getBBox(), vb = sv.viewBox && sv.viewBox.baseVal, sr = sv.getBoundingClientRect(); if (!vb || !vb.width || !bb.width) continue;
        const sx = sr.width / vb.width; l = Math.min(l, sr.left + (bb.x - vb.x) * sx); r = Math.max(r, sr.left + (bb.x - vb.x + bb.width) * sx); } catch (x) {}
    }
    return l < 1e8 ? { l, r } : null;
  }
  function richte(e) {
    const rr = e.getBoundingClientRect(); if (!rr.width) return;   // unsichtbar: nichts anfassen
    for (let x = e; x; x = x.parentElement) { const t = getComputedStyle(x).transform; if (t && t !== 'none' && !/^matrix\(1, 0, 0, 1,/.test(t)) return; }   // während einer Bewegung (scale) nicht messen
    const c = getComputedStyle(e), bl = parseFloat(c.borderLeftWidth), br = parseFloat(c.borderRightWidth);
    const k = tinte(e); if (!k) return;
    const dx = (k.l + k.r) / 2 - (rr.left + bl + (rr.width - bl - br) / 2); if (Math.abs(dx) < .15) return;
    e.style.paddingLeft = (parseFloat(c.paddingLeft) - dx).toFixed(2) + 'px'; e.style.paddingRight = (parseFloat(c.paddingRight) + dx).toFixed(2) + 'px';
  }
  function los(sel) { document.querySelectorAll(sel).forEach(richte); }
  window.WOmitte = function (sel) {
    offen.add(sel);
    requestAnimationFrame(() => los(sel));
    setTimeout(() => los(sel), 700);   // nach Auftritts-Bewegungen (scale) noch einmal
    if (document.fonts) document.fonts.ready.then(() => requestAnimationFrame(() => los(sel)));
  };
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => offen.forEach(los), 150); });
})();
