/* The WVEZ monogram drawn in text, with a shine crossing it every few seconds, in place
   of the spinning 3D pendant at the top of each demo, and over the title of each post.

   The art is the round monogram (favicon-512.png) drawn the way ascii.rest draws its
   company logos: each cell holds the IBM Plex Mono character whose shape best matches
   the logo's edge through it, and 8 where it is solid. It was made by make.py in the
   local preview kit, from the logo's white letter faces. The shine follows the "polar"
   piece from ascii.rest by bas3line (https://github.com/bas3line/ascii), under the MIT
   License below: a slanted band that turns solid characters into slashes and lightens
   them as it passes. It plays only while the logo is on screen, and holds still for
   readers who prefer reduced motion.

   MIT License below. Changed here: plain JavaScript instead of TypeScript, and the
   grid size is passed in so the wall fills whatever box it sits in. The player at
   the bottom is this site's own: it plays only while the box is on screen, holds
   the first frame for readers who prefer reduced motion, and follows the light
   switch.

   MIT License

   Copyright (c) 2026 bas3line (https://github.com/bas3line)

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE. */
(function () {
  'use strict';

  var ART = "              _pqqqpqqppq_\n         _p`]08888P `888888OL _\n       ,P88L_88888 /p`88888]LJ8b,\n     _ 8}88888888b`88 {888[88888dP\n    p8L`8888_J8888 88 8888`q8888d qb_\n   d880 Y888l 8888LJ}`8888 }8888L_880_\n  d888`_`8888`J888}`LJ888L 88888`d888b\n `888LJ8 J888L`8888 `{888`J8888{d88888L\n J888 d8b 8888 J888p 888} d88888888888]\n J888`888LJ888L`888[`888L`888O8888`888}\n `888d8888L888b Y888J888 J888d888`_888L\n  J888888888888_J888888P 888L`88` d88P\n   J8888P888888L 888888`q888` 8` d88P`\n    `888L`888888 J88888 {88Y  _q888P\n      \"d8 `88888L 8888L`888L 0888P`\n        `\\ `888880888888888``8P\"`\n             \"Y08`J888`88P\"\n                   ``".split('\n');
  var COLS = 39, ROWS = ART.length;
  for (var r = 0; r < ROWS; r++) while (ART[r].length < COLS) ART[r] += ' ';

  var START = 0.5;    // seconds before the first shine
  var PASS = 2;       // seconds a shine takes to cross
  var EVERY = 5;      // seconds from one shine to the next
  var HALF = 5;       // half the band's width, in cells
  var LEAN = 0.9;     // cells it shifts left a row down, so it leans like a slash
  var SOLID = '8dbqpPYOo0';                  // what the shine turns to slashes
  // ascii.rest's greys for a dark page. A page can set its own through --monogram-ink,
  // --monogram-glow and --monogram-peak (the posts do, for light mode).
  var INK = 'var(--monogram-ink,#b3b3b3)', GLOW = 'var(--monogram-glow,#e8ebef)', PEAK = 'var(--monogram-peak,#ffffff)';

  // The band crosses the logo's ink, edge to edge, rather than the whole box.
  var lo = Infinity, hi = -Infinity;
  ART.forEach(function (line, y) {
    for (var x = 0; x < COLS; x++) if (line[x] !== ' ') { lo = Math.min(lo, x + LEAN * y); hi = Math.max(hi, x + LEAN * y); }
  });
  var span = hi - lo + 2 * HALF;

  function frame(t) {
    var since = t - START;
    var at = since >= 0 ? lo - HALF + (span * (since % EVERY)) / PASS : -Infinity;
    var out = [];
    for (var y = 0; y < ROWS; y++) {
      var line = '';
      for (var x = 0; x < COLS; x++) {
        var ch = ART[y][x];
        if (ch === ' ') { line += ' '; continue; }
        var d = Math.abs(x + LEAN * y - at);
        var k = d < HALF ? 1 - d / HALF : 0;
        k = k * k * (3 - 2 * k);
        if (k > 0.55 && SOLID.indexOf(ch) !== -1) ch = '/';
        if (ch === '<') ch = '&lt;'; else if (ch === '>') ch = '&gt;'; else if (ch === '&') ch = '&amp;';
        line += k > 0.6 ? '<span style="color:' + PEAK + '">' + ch + '</span>'
              : k > 0.25 ? '<span style="color:' + GLOW + '">' + ch + '</span>' : ch;
      }
      out.push(line);
    }
    return out.join('\n');
  }

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // As a style rule rather than inline, so a page's own rules (the demos hide the logo on
  // phones) still win. Letter spacing is zeroed because the fit below assumes 0.6em cells
  // and the posts' body text is spaced out.
  var css = document.createElement('style');
  css.textContent = '.demo-monogram{display:flex;align-items:center;justify-content:center;margin:0;' +
    "font-family:'IBM Plex Mono',monospace;letter-spacing:0;color:" + INK + ';white-space:pre;overflow:hidden;user-select:none;pointer-events:none}';
  document.head.appendChild(css);

  [].forEach.call(document.querySelectorAll('.demo-monogram'), function (box) {
    var inner = document.createElement('span');
    box.appendChild(inner);

    // Fit the art to the box's width: a cell is 0.6em wide and twice as tall.
    function fit() {
      var fs = box.clientWidth / (COLS * 0.6);
      inner.style.fontSize = fs + 'px';
      inner.style.lineHeight = (fs * 1.2) + 'px';
    }
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box);

    var onScreen = false, raf = 0, last = 0, t0 = performance.now();
    function tick(now) {
      raf = 0;
      if (!onScreen) return;
      if (now - last >= 1000 / 30) { last = now; inner.innerHTML = frame((now - t0) / 1000); }
      raf = requestAnimationFrame(tick);
    }
    inner.innerHTML = frame(-1);
    if (still) return;
    new IntersectionObserver(function (e) {
      onScreen = e[0].isIntersecting;
      if (onScreen && !raf) raf = requestAnimationFrame(tick);
    }).observe(box);
  });
})();
