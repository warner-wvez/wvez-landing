/* The moving ascii brick wall behind the email signup box.

   The wall is "rotozoomer" from ascii.rest by bas3line, copied from
   https://github.com/bas3line/ascii/blob/main/src/pieces/rotozoomer.ts under the
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

  /* ---- The piece (ascii.rest, MIT) ---- */
  // One shade for each surface of the wall, as in text-mode demos: mortar,
  // shadowed bevel, brick face, side-lit bevel, top-lit bevel.
  var SHADES = ' ░▒▓█';
  var CUT = [0.12, 0.44, 0.78, 0.93]; // where each shade gives way to the next
  var P = 16; // seconds for one full turn; the zoom and the drift repeat in it
  var W = (2 * Math.PI) / P;
  var M = 0.085; // half the mortar joint, in brick heights
  var B = 0.15;  // bevel width, in brick heights
  var FACE = 0.66, MORTAR = 0.02;
  var EDGE = [1, 0.86, 0.3, 0.22]; // top, left, right and bottom bevels: lit from the upper left

  // Brightness at (u, v), in brick heights; a brick is two long and every other
  // course is set half a brick over.
  function tex(u, v) {
    var iv = Math.floor(v);
    var x = u + (iv & 1);
    var lx = x - 2 * Math.floor(x / 2) - M, ly = v - iv - M;
    var w = 2 - 2 * M, h = 1 - 2 * M;
    if (lx < 0 || ly < 0 || lx > w || ly > h) return MORTAR;
    var e = Math.min(ly, lx, w - lx, h - ly);
    if (e > B) return FACE;
    return EDGE[e === ly ? 0 : e === lx ? 1 : e === w - lx ? 2 : 3];
  }

  function rotozoomer(cols, rows) {
    var out = new Array(cols);
    // Nine samples to a cell, in cell widths from its centre, rows counted double.
    var SX = [], SY = [];
    for (var j = 0; j < 3; j++) {
      for (var i = 0; i < 3; i++) {
        SX.push((i - 1) / 3);
        SY.push(((j - 1) / 3) * 2);
      }
    }

    return function (t, paper) {
      // The turn lingers where the courses run square to the screen.
      var th = W * t + 0.08;
      var a = th - 0.14 * Math.sin(4 * th);
      var L = 13 * Math.exp(0.25 * Math.cos(2 * W * t)); // brick height, in cell widths
      var ca = Math.cos(a) / L, sa = Math.sin(a) / L;
      // The wall drifts two bricks along and two courses up a loop, so it closes.
      var u0 = (4 * t) / P + 0.7 * Math.sin(W * t) + 0.35;
      var v0 = (2 * t) / P + 0.7 * Math.cos(W * t) - 0.2;
      var lines = [];
      for (var r = 0; r < rows; r++) {
        var y = (r + 0.5 - rows / 2) * 2;
        for (var c = 0; c < cols; c++) {
          var x = c + 0.5 - cols / 2;
          var v = 0;
          for (var s = 0; s < 9; s++) {
            var px = x + SX[s], py = y + SY[s];
            v += tex(px * ca + py * sa + u0, py * ca - px * sa + v0);
          }
          v /= 9;
          var k = 0;
          while (k < 4 && v > CUT[k]) k++;
          out[c] = SHADES[paper ? 4 - k : k];
        }
        lines.push(out.join(''));
      }
      return lines.join('\n');
    };
  }

  /* ---- The player (this site) ---- */
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var FPS = 30;

  // Light mode is dark ink on a light ground, so the ramp flips ("paper").
  function isPaper() {
    var mode = document.documentElement.getAttribute('data-theme');
    if (mode === 'dark') return false;
    if (mode === 'light') return true;
    return !window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  [].forEach.call(document.querySelectorAll('.subscribe'), function (box) {
    var pre = document.createElement('pre');
    pre.className = 'subscribe-art';
    pre.setAttribute('aria-hidden', 'true');
    box.insertBefore(pre, box.firstChild);

    var frame = null, cols = 0, rows = 0, onScreen = false, raf = 0, last = 0, start = performance.now();

    // One character's size in the art's font, to work out how many fit.
    function fit() {
      var probe = document.createElement('span');
      probe.textContent = 'MMMMMMMMMM';
      pre.textContent = '';
      pre.appendChild(probe);
      var cw = probe.getBoundingClientRect().width / 10;
      var ch = parseFloat(getComputedStyle(pre).lineHeight);
      pre.removeChild(probe);
      var c = Math.ceil(box.clientWidth / cw), r = Math.ceil(box.clientHeight / ch);
      if (c !== cols || r !== rows) { cols = c; rows = r; frame = rotozoomer(cols, rows); }
      draw(still.matches ? 0 : (performance.now() - start) / 1000);
    }

    function draw(t) { if (frame) pre.textContent = frame(t, isPaper()); }

    function tick(now) {
      raf = 0;
      if (!onScreen || still.matches) return;
      if (now - last >= 1000 / FPS) { last = now; draw((now - start) / 1000); }
      raf = requestAnimationFrame(tick);
    }
    function play() { if (!raf && onScreen && !still.matches) raf = requestAnimationFrame(tick); }

    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      play();
    }).observe(box);
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box);
    document.addEventListener('wvez:theme', function () { draw((performance.now() - start) / 1000); });
    still.addEventListener('change', function () { fit(); play(); });
    fit();
    // Measured again once the web font is in, since the stand-in font is wider.
    if (document.fonts) document.fonts.ready.then(fit);
  });
})();
