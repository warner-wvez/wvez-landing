/* Light and dark mode, switched by pulling a pixel-art dot on a string, after
   the pull-cord switch in GIMMIE. Pull the dot down (or tap it) to switch.
   The choice is remembered; with no choice yet, the reader's system setting
   decides. This file loads in <head> so the page never paints in the wrong
   mode first.

   The string is a small physics model: a chain of points pulled by gravity,
   joined by links that stretch a little and spring back. It is drawn on a
   canvas where one pixel of the drawing is 2px on screen, so it stays pixel
   art while it swings. */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'wvez-theme';

  function apply(dark) { root.setAttribute('data-theme', dark ? 'dark' : 'light'); }
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
  if (saved === 'dark' || saved === 'light') apply(saved === 'dark');
  else apply(!!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches));

  function setTheme(dark) {
    apply(dark);
    try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (e) { /* storage blocked */ }
    document.dispatchEvent(new CustomEvent('wvez:theme', { detail: { dark: dark } }));
  }

  /* The dot, one character per pixel.
     o outline   g fill   h highlight   s shade */
  var DOT = [
    '..oooo..',
    '.ohhggo.',
    'ohhggggo',
    'ohggggso',
    'oggggsso',
    'ogggssso',
    '.ogssso.',
    '..oooo..'
  ];
  var LIT = { g: '#fde047', h: '#fef9c3', s: '#eab308' };
  var OFF = { g: '#3f3f46', h: '#71717a', s: '#27272a' };

  // Sizes are in drawing pixels; each one is 2px on screen.
  var PX = 2;
  var W = 48, H = 52;               // canvas
  var ANCHOR_X = 36;                // where the string hangs from, at the top edge
  var LINKS = 8, LINK = 1.6;        // string: 8 links, about 26px long at rest
  var GRAVITY = 0.2;
  var DAMPING = 0.976;              // closer to 1 swings longer
  var MAX_SPEED = 2.4;              // caps the fling so a hard pull can't launch the dot off the top
  var STIFFNESS = 0.22;             // under 1 lets the string stretch and spring back
  var ITERATIONS = 12;
  var DOT_WEIGHT = 4;               // the dot is heavier than the string
  var PULL_LIMIT = 22;              // how far below rest the dot can be dragged
  var SWING_LIMIT = 14;             // how far sideways
  var THRESHOLD = 11, TAP = 2.5;    // a pull past THRESHOLD, or a tap, switches

  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) DAMPING = 0.6;

  document.addEventListener('DOMContentLoaded', function () {
    var box = document.createElement('div');
    box.className = 'pull-switch';
    box.innerHTML = '<canvas width="' + W + '" height="' + H + '" aria-hidden="true"></canvas>' +
      '<button type="button" class="pull-dot" title="Pull the string to switch light and dark"></button>';
    document.body.appendChild(box);
    var canvas = box.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var hit = box.querySelector('.pull-dot');

    // The string: point 0 is pinned to the top edge, the last point is the dot.
    var pts = [];
    for (var i = 0; i <= LINKS; i++) {
      pts.push({ x: ANCHOR_X, y: i * LINK, px: ANCHOR_X, py: i * LINK, w: i === LINKS ? DOT_WEIGHT : 1 });
    }
    var dot = pts[LINKS];

    function step() {
      for (var i = 1; i < pts.length; i++) {
        var p = pts[i];
        if (p === dot && dragging) continue;
        var vx = (p.x - p.px) * DAMPING, vy = (p.y - p.py) * DAMPING;
        var sp = Math.sqrt(vx * vx + vy * vy);
        if (sp > MAX_SPEED) { vx *= MAX_SPEED / sp; vy *= MAX_SPEED / sp; }
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + GRAVITY;
      }
      for (var k = 0; k < ITERATIONS; k++) {
        for (var j = 0; j < LINKS; j++) {
          var a = pts[j], b = pts[j + 1];
          var dx = b.x - a.x, dy = b.y - a.y;
          var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          var diff = (d - LINK) / d * STIFFNESS;
          // Point 0 never moves; a dragged dot never moves; otherwise lighter points move more.
          var ia = j === 0 ? 0 : 1 / a.w;
          var ib = (b === dot && dragging) ? 0 : 1 / b.w;
          if (ia + ib === 0) continue;
          var sa = ia / (ia + ib), sb = ib / (ia + ib);
          a.x += dx * diff * sa; a.y += dy * diff * sa;
          b.x -= dx * diff * sb; b.y -= dy * diff * sb;
        }
      }
      // Keep everything on the canvas.
      for (var m = 1; m < pts.length; m++) {
        pts[m].x = Math.max(4, Math.min(W - 5, pts[m].x));
        pts[m].y = Math.max(0, Math.min(H - 9, pts[m].y));
      }
    }

    // Let the string settle once so "rest" is where gravity leaves it.
    for (var s0 = 0; s0 < 400; s0++) step();
    var restY = dot.y;

    function plot(x, y, color) { ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1); }
    function line(x0, y0, x1, y1, color) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
      for (;;) {
        plot(x0, y0, color);
        if (x0 === x1 && y0 === y1) break;
        var e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }

    var colors = {};
    function readColors() {
      var cs = getComputedStyle(root);
      colors.fg = cs.getPropertyValue('--fg').trim() || '#000';
      colors.muted = cs.getPropertyValue('--muted').trim() || '#888';
      var c = isDark() ? OFF : LIT;
      colors.g = c.g; colors.h = c.h; colors.s = c.s; colors.o = colors.fg;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < LINKS; i++) line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, colors.muted);
      var ox = Math.round(dot.x) - 4, oy = Math.round(dot.y);
      DOT.forEach(function (row, y) {
        for (var x = 0; x < row.length; x++) if (row[x] !== '.') plot(ox + x, oy + y, colors[row[x]]);
      });
      hit.style.transform = 'translate(' + (dot.x * PX - 12) + 'px,' + (dot.y * PX - 4) + 'px)';
    }

    // Run the model only while something is moving; stop once it is still.
    var running = false, quiet = 0, last = 0, acc = 0;
    function frame(t) {
      acc += Math.min(64, t - (last || t));
      last = t;
      while (acc >= 16.67) { step(); acc -= 16.67; }
      draw();
      var energy = 0;
      for (var i = 1; i < pts.length; i++) energy += Math.abs(pts[i].x - pts[i].px) + Math.abs(pts[i].y - pts[i].py);
      quiet = (energy < 0.05 && !dragging) ? quiet + 1 : 0;
      if (quiet > 30) { running = false; last = 0; acc = 0; return; }
      requestAnimationFrame(frame);
    }
    function wake() { if (!running) { running = true; quiet = 0; requestAnimationFrame(frame); } }

    function label() { hit.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode'); }
    readColors(); label();
    // Each time a post opens, the string starts bunched at the top edge and
    // drops to rest with a small bounce. Readers who ask for less motion get
    // it already hanging.
    if (!still) {
      for (var d0 = 1; d0 < pts.length; d0++) { pts[d0].x = pts[d0].px = ANCHOR_X; pts[d0].y = pts[d0].py = 0; }
      dot.px = dot.x + 0.5;           // a slight sideways start so it swings as it lands
      draw();
      setTimeout(wake, 250);
    } else {
      draw();
    }
    document.addEventListener('wvez:theme', function () {
      readColors(); label();
      dot.py = dot.y + 2.2;           // a little hop when the mode changes
      wake();
    });

    // Dragging: the dot follows the pointer, the string stretches behind it,
    // and letting go flings it back up.
    var dragging = false, grabX = 0, grabY = 0, moved = 0, startDot = null;
    function toLocal(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / PX, y: (e.clientY - r.top) / PX };
    }
    hit.addEventListener('pointerdown', function (e) {
      dragging = true;
      var p = toLocal(e);
      grabX = p.x - dot.x; grabY = p.y - dot.y;
      startDot = { x: dot.x, y: dot.y };
      moved = 0;
      hit.classList.add('grabbing');
      try { hit.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      e.preventDefault();
      wake();
    });
    hit.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var p = toLocal(e);
      var nx = Math.max(ANCHOR_X - SWING_LIMIT, Math.min(ANCHOR_X + 6, p.x - grabX));
      var ny = Math.max(restY - 6, Math.min(restY + PULL_LIMIT, p.y - grabY));
      dot.px = dot.x; dot.py = dot.y;
      dot.x = nx; dot.y = ny;
      moved = Math.max(moved, Math.abs(nx - startDot.x) + Math.abs(ny - startDot.y));
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      hit.classList.remove('grabbing');
      var pulled = dot.y - restY;
      if (moved < TAP || pulled >= THRESHOLD) setTheme(!isDark());
      wake();
    }
    hit.addEventListener('pointerup', release);
    hit.addEventListener('pointercancel', release);
    hit.addEventListener('lostpointercapture', release);
    hit.addEventListener('click', function (e) { e.preventDefault(); });
    hit.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTheme(!isDark()); }
    });

    // Brushing past the string with the mouse sets it swinging.
    var lastMove = null;
    window.addEventListener('pointermove', function (e) {
      if (dragging || still || e.pointerType !== 'mouse') { lastMove = null; return; }
      var p = toLocal(e);
      if (lastMove && p.x > -4 && p.x < W + 4 && p.y > -4 && p.y < H + 4) {
        var vx = p.x - lastMove.x, vy = p.y - lastMove.y, touched = false;
        for (var i = 1; i < pts.length; i++) {
          var q = pts[i], dx = q.x - p.x, dy = q.y - p.y;
          if (dx * dx + dy * dy < 9) {
            q.px -= Math.max(-2, Math.min(2, vx)) * 0.6;
            q.py -= Math.max(-2, Math.min(2, vy)) * 0.3;
            touched = true;
          }
        }
        if (touched) wake();
      }
      lastMove = p;
    }, { passive: true });
  });
})();
