/* Post pages: the section rail, link previews and workflow diagrams.
   All three are extras on top of plain HTML. With this file missing, links
   are ordinary links, diagrams are fixed-height frames, and there is no rail. */
(function () {
  'use strict';

  var body = document.querySelector('.post-body');
  if (!body) return;

  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Diagrams follow the light switch. Each one reads the setting when it loads;
  // this keeps the ones already open in step when the reader flips it.
  document.addEventListener('wvez:theme', function () {
    var mode = document.documentElement.getAttribute('data-theme');
    [].forEach.call(document.querySelectorAll('.wf-embed iframe, .wf-split iframe, .wf-viewer iframe'), function (f) {
      try { f.contentDocument.documentElement.setAttribute('data-theme', mode); } catch (e) { /* not loaded yet */ }
    });
  });

  // Clicking an image opens it full size in front of the post.
  [].forEach.call(body.querySelectorAll('img'), function (img) {
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Enlarge image' + (img.alt ? ': ' + img.alt : ''));
    img.addEventListener('click', function () { openImage(img); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openImage(img); }
    });
  });

  // Links in a post open in a new tab, so a reader never loses their place.
  // Jumps within the page (#section) stay in the same tab.
  [].forEach.call(body.querySelectorAll('a[href]'), function (a) {
    if (a.getAttribute('href').charAt(0) === '#') return;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------------------------------------------------------------
     SECTION RAIL. One short line per heading at the right edge of the
     screen, like Notion's outline. Hovering the lines opens the list.
     --------------------------------------------------------------- */
  (function rail() {
    var heads = [].slice.call(body.querySelectorAll('h2[id], h3[id]'));
    if (heads.length < 3) return;

    var nav = document.createElement('nav');
    nav.className = 'toc';
    nav.setAttribute('aria-label', 'Sections');
    var lines = document.createElement('div');
    lines.className = 'toc-lines';
    lines.setAttribute('aria-hidden', 'true');
    var list = document.createElement('ol');
    list.className = 'toc-panel';

    heads.forEach(function (h) {
      var level = h.tagName === 'H3' ? 'l3' : 'l2';
      var line = document.createElement('span');
      line.className = 'toc-line ' + level;
      lines.appendChild(line);
      var li = document.createElement('li');
      li.className = level;
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        h.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + h.id);
      });
      li.appendChild(a);
      list.appendChild(li);
    });

    nav.appendChild(lines);
    nav.appendChild(list);
    document.body.appendChild(nav);

    var lineEls = lines.children, itemEls = list.children, current = -2;
    function mark() {
      var edge = window.innerHeight * 0.3, idx = -1;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top <= edge) idx = i;
      }
      if (idx === current) return;
      current = idx;
      for (var j = 0; j < heads.length; j++) {
        lineEls[j].classList.toggle('on', j === idx);
        itemEls[j].classList.toggle('on', j === idx);
      }
    }
    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; mark(); });
    }, { passive: true });
    window.addEventListener('resize', mark);
    mark();
  })();

  /* ---------------------------------------------------------------
     LINK PREVIEWS. Hovering a link to an image, video or audio file, or
     to a YouTube video, shows it in a box next to the link. Leaving the
     link and the box stops it. On phones a tap opens the box instead.
     A link given a definition shows that text instead, like a dictionary.

     A post can point a link at a local file or a clip window in its front
     matter, keyed by the link's address:
       previews:
         "https://www.youtube.com/watch?v=ID":
           src: /assets/blog/<slug>/clip.mp4    # play this file instead
           start: 12                            # seconds, YouTube only
           end: 19
           label: Iron Man (2008)
         "https://larping.urbanup.com/15927973":
           word: larping                        # shown in bold above the text
           define: When someone is pretending...
           credit: Urban Dictionary
     --------------------------------------------------------------- */
  var settings = {};
  try {
    var json = document.getElementById('post-previews');
    settings = (json && JSON.parse(json.textContent)) || {};
  } catch (e) { settings = {}; }

  var IMAGE = /\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i;
  var VIDEO = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
  var AUDIO = /\.(mp3|m4a|wav|ogg|aac)(\?|#|$)/i;

  function youtubeId(url) {
    var m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function youtubeStart(url) {
    var m = url.match(/[?&#]t=(\d+)/);
    return m ? +m[1] : 0;
  }

  function describe(a) {
    var href = a.getAttribute('href') || '';
    var opt = settings[href] || {};
    if (typeof opt === 'string') opt = { src: opt };
    if (a.dataset.preview === 'none' || opt.src === 'none') return null;
    if (opt.define) {
      return {
        kind: 'define', href: href, label: '',
        word: opt.word || a.textContent.trim(), define: String(opt.define),
        credit: opt.credit || '', source: opt.source || href
      };
    }
    var src = opt.src || href;
    var kind = IMAGE.test(src) || /i\.ytimg\.com\//.test(src) ? 'image'
      : VIDEO.test(src) ? 'video'
      : AUDIO.test(src) ? 'audio'
      : youtubeId(src) ? 'youtube'
      : null;
    if (!kind) return null;
    return {
      kind: kind, src: src, href: href,
      start: opt.start != null ? +opt.start : (kind === 'youtube' ? youtubeStart(src) : 0),
      end: opt.end != null ? +opt.end : null,
      label: opt.label || (kind === 'youtube' ? 'YouTube' : ''),
      // Credit line under the player, linking to where the clip came from.
      credit: opt.credit || (youtubeId(href) ? 'YouTube' : ''),
      source: opt.source || href
    };
  }

  var links = [].slice.call(body.querySelectorAll('a[href]')).filter(function (a) {
    if (a.closest('.wf-embed')) return false;
    var p = describe(a);
    if (p) { a.__preview = p; a.classList.add('has-preview', 'pv-' + p.kind); }
    return !!p;
  });
  if (!links.length) return finishDiagrams();

  var box = document.createElement('div');
  box.className = 'pv';
  box.hidden = true;
  box.innerHTML = '<div class="pv-media"></div><div class="pv-cap"><span class="pv-label"></span><button type="button" class="pv-sound"></button></div>'
    + '<a class="pv-credit" target="_blank" rel="noopener"></a>';
  document.body.appendChild(box);
  var mediaSlot = box.querySelector('.pv-media');
  var labelEl = box.querySelector('.pv-label');
  var creditEl = box.querySelector('.pv-credit');
  var soundBtn = box.querySelector('.pv-sound');

  var active = null, media = null, hideTimer = null, pointer = { x: 0, y: 0 };

  function hasGesture() {
    return !navigator.userActivation || navigator.userActivation.hasBeenActive;
  }

  function build(p) {
    var el;
    if (p.kind === 'define') {
      el = document.createElement('div');
      el.className = 'pv-def';
      var word = document.createElement('p');
      word.className = 'pv-word';
      word.textContent = p.word;
      el.appendChild(word);
      // A blank line in the front matter starts a new paragraph.
      p.define.trim().split(/\n\s*\n/).forEach(function (t) {
        var para = document.createElement('p');
        para.textContent = t.trim();
        el.appendChild(para);
      });
      return el;
    }
    if (p.kind === 'image') {
      el = document.createElement('img');
      el.alt = '';
      // YouTube's smaller thumbnails have black bars baked in. The full size
      // one does not, so try it first and fall back if the video lacks one.
      var bars = p.src.match(/^(https:\/\/i\.ytimg\.com\/vi\/[\w-]{11}\/)(?:sd|hq|mq)?default\.jpg/);
      if (bars) {
        el.addEventListener('error', function () { el.src = p.src; }, { once: true });
        el.src = bars[1] + 'maxresdefault.jpg';
      } else {
        el.src = p.src;
      }
      el.addEventListener('load', function () { if (media === el) place(); });
    } else if (p.kind === 'video' || p.kind === 'audio') {
      el = document.createElement(p.kind);
      el.src = p.src;
      el.preload = 'auto';
      el.playsInline = true;
      if (p.kind === 'audio') {
        var wrap = document.createElement('div');
        wrap.className = 'pv-audio';
        wrap.innerHTML = '<div class="pv-bar"><span></span></div>';
        wrap.appendChild(el);
        var fill = wrap.querySelector('.pv-bar span');
        el.addEventListener('timeupdate', function () {
          fill.style.width = (el.duration ? el.currentTime / el.duration * 100 : 0) + '%';
        });
        wrap.__player = el;
        return wrap;
      }
    } else {
      el = document.createElement('div');
      el.className = 'pv-yt';
    }
    return el;
  }

  function playerOf(el) { return el.__player || el; }

  function setSound(state) {
    // state: 'on' | 'off' | 'none'
    soundBtn.hidden = state === 'none';
    soundBtn.textContent = state === 'on' ? 'Mute' : 'Click for sound';
    soundBtn.dataset.state = state;
  }

  function startYoutube(p, slot, muted) {
    var q = 'autoplay=1&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&mute=' + (muted ? 1 : 0)
      + '&start=' + (p.start || 0) + (p.end ? '&end=' + p.end : '');
    slot.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + youtubeId(p.src) + '?' + q
      + '" title="Video preview" allow="autoplay; encrypted-media" tabindex="-1"></iframe>';
  }

  function youtubeCommand(func) {
    var f = mediaSlot.querySelector('iframe');
    if (f) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), '*');
  }

  function play(p, el) {
    if (p.kind === 'image' || p.kind === 'define') { setSound('none'); return; }
    if (p.kind === 'youtube') {
      var muted = !hasGesture();
      startYoutube(p, el, muted);
      setSound(muted ? 'off' : 'on');
      return;
    }
    var m = playerOf(el);
    try { m.currentTime = p.start || 0; } catch (e) { /* not loaded yet */ }
    m.muted = false;
    setSound('on');
    var go = m.play();
    if (go && go.catch) {
      go.catch(function () {
        // The browser blocks sound until the reader has clicked somewhere
        // on the page. Video plays silently instead; audio waits.
        if (active === null || playerOf(media) !== m) return;
        setSound('off');
        if (p.kind === 'video') { m.muted = true; m.play().catch(function () {}); }
      });
    }
  }

  function stop(p, el) {
    if (!el) return;
    if (p.kind === 'youtube') { el.innerHTML = ''; return; }
    if (p.kind === 'image' || p.kind === 'define') return;
    var m = playerOf(el);
    m.pause();
    try { m.currentTime = p.start || 0; } catch (e) { /* ignore */ }
  }

  function show(a) {
    clearTimeout(hideTimer);
    if (active === a) return;
    if (active) hide(true);
    active = a;
    var p = a.__preview;
    if (!a.__media) a.__media = build(p);
    media = a.__media;
    mediaSlot.innerHTML = '';
    mediaSlot.appendChild(media);
    box.className = 'pv pv-' + p.kind;
    labelEl.textContent = p.label;
    creditEl.hidden = !p.credit;
    creditEl.textContent = p.credit ? 'Via ' + p.credit : '';
    creditEl.href = p.source;
    box.hidden = false;
    place();
    play(p, media);
  }

  function hide(now) {
    clearTimeout(hideTimer);
    if (!now) { hideTimer = setTimeout(function () { hide(true); }, 160); return; }
    if (!active) return;
    stop(active.__preview, media);
    active = null;
    media = null;
    box.hidden = true;
    mediaSlot.innerHTML = '';
  }

  function place() {
    if (!active) return;
    var rects = active.getClientRects(), r = rects[0];
    for (var i = 0; i < rects.length; i++) {
      if (pointer.y >= rects[i].top && pointer.y <= rects[i].bottom) { r = rects[i]; break; }
    }
    if (!r) return;
    var vw = document.documentElement.clientWidth, gap = 8, pad = 16;
    var w = box.offsetWidth, h = box.offsetHeight;
    var cx = pointer.x && pointer.y >= r.top && pointer.y <= r.bottom ? pointer.x : r.left + r.width / 2;
    var left = Math.max(pad, Math.min(cx - w / 2, vw - w - pad));
    var top = r.top - h - gap;
    if (top < pad) top = r.bottom + gap;
    box.style.left = Math.round(left + window.scrollX) + 'px';
    box.style.top = Math.round(top + window.scrollY) + 'px';
  }

  links.forEach(function (a) {
    if (canHover) {
      a.addEventListener('mouseenter', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; show(a); });
      a.addEventListener('mouseleave', function () { hide(false); });
      a.addEventListener('focus', function () { pointer.x = 0; pointer.y = 0; show(a); });
      a.addEventListener('blur', function () { hide(false); });
    } else {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var r = a.getClientRects()[0];
        pointer.x = e.clientX || (r && r.left); pointer.y = e.clientY || (r && r.top);
        if (active === a) hide(true); else show(a);
      });
    }
  });

  box.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
  box.addEventListener('mouseleave', function () { if (canHover) hide(false); });

  function toggleSound() {
    if (!active) return;
    var p = active.__preview, turnOn = soundBtn.dataset.state !== 'on';
    if (p.kind === 'youtube') {
      youtubeCommand(turnOn ? 'unMute' : 'mute');
      if (turnOn) youtubeCommand('playVideo');
    } else {
      var m = playerOf(media);
      m.muted = !turnOn;
      if (turnOn) m.play().catch(function () {});
    }
    setSound(turnOn ? 'on' : 'off');
  }
  soundBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleSound(); });
  mediaSlot.addEventListener('click', function () { if (!soundBtn.hidden) toggleSound(); });

  document.addEventListener('click', function (e) {
    if (!canHover && active && !box.contains(e.target) && e.target.closest('a') !== active) hide(true);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(true); });
  window.addEventListener('resize', place);
  // A clip or image can change the box's size once it loads (a 4:3 clip is
  // taller than the 16:9 guess), so place it again whenever its size changes.
  if ('ResizeObserver' in window) new ResizeObserver(function () { place(); }).observe(box);

  // Warm the cache so the first hover shows something straight away.
  var warm = function () {
    links.forEach(function (a) {
      var p = a.__preview;
      if (p.kind === 'image' && !a.__media) a.__media = build(p);
      if ((p.kind === 'video' || p.kind === 'audio') && !a.__media) a.__media = build(p);
    });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(warm); else setTimeout(warm, 1200);

  finishDiagrams();

  /* ---------------------------------------------------------------
     WORKFLOW DIAGRAMS. Each one is its own page in a frame. The frame
     grows and shrinks with the diagram so it never scrolls on its own.
     --------------------------------------------------------------- */
  function finishDiagrams() {
    // A set of diagrams shows one at a time, picked by its tabs.
    [].forEach.call(document.querySelectorAll('.wf-set'), function (set) {
      var tabs = [].slice.call(set.querySelectorAll('.wf-tab'));
      var panes = [].slice.call(set.querySelectorAll('.wf-pane'));
      function pick(i, focus) {
        tabs.forEach(function (t, j) {
          t.setAttribute('aria-selected', j === i ? 'true' : 'false');
          t.tabIndex = j === i ? 0 : -1;
        });
        panes.forEach(function (p, j) { p.hidden = j !== i; });
        if (focus) tabs[i].focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { pick(i); });
        t.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight') pick((i + 1) % tabs.length, true);
          if (e.key === 'ArrowLeft') pick((i - 1 + tabs.length) % tabs.length, true);
        });
      });
      pick(0);
    });

    // Bullets beside their diagrams: clicking a bullet shows its diagram.
    [].forEach.call(document.querySelectorAll('.wf-split'), function (split) {
      var list = split.querySelector('.wf-split-text ul, .wf-split-text ol');
      if (!list) return;
      var items = [].filter.call(list.children, function (li) { return li.tagName === 'LI'; });
      var panes = {}, picks = [];
      [].forEach.call(split.querySelectorAll('.wf-pane'), function (p) { panes[p.dataset.wf] = p; });
      function pick(li, scroll) {
        picks.forEach(function (x) { x.setAttribute('aria-pressed', x === li ? 'true' : 'false'); });
        Object.keys(panes).forEach(function (k) { panes[k].hidden = items[k] !== li; });
        // When the diagram sits under the list, bring it into view.
        if (scroll && getComputedStyle(split).display !== 'grid') {
          panes[items.indexOf(li)].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
      items.forEach(function (li, i) {
        if (!panes[i]) return;
        li.classList.add('wf-pick');
        li.tabIndex = 0;
        li.setAttribute('role', 'button');
        li.addEventListener('click', function (e) { if (!e.target.closest('a')) pick(li, true); });
        li.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(li, true); }
        });
        picks.push(li);
      });
      if (picks.length) pick(picks[0], false);

      var larger = split.querySelector('.wf-larger');
      if (larger) larger.addEventListener('click', function () {
        var f = [].filter.call(split.querySelectorAll('.wf-pane'), function (p) { return !p.hidden; })[0];
        if (f) openLarger(f.querySelector('iframe'), larger);
      });
    });

    // Cards in a grid: each card's "View larger" opens its own diagram.
    [].forEach.call(document.querySelectorAll('.wf-card'), function (card) {
      var larger = card.querySelector('.wf-larger'), f = card.querySelector('iframe');
      if (larger && f) larger.addEventListener('click', function () { openLarger(f, larger); });
    });

    [].forEach.call(document.querySelectorAll('.wf-embed iframe, .wf-split iframe'), fitFrame);
  }

  // The full size view: a window over the post, closed by its x or Esc. It
  // shows either a diagram or an image with its caption.
  var viewer = null, viewerFrom = null;
  function showInViewer(content, from, kind) {
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.className = 'wf-viewer';
      viewer.setAttribute('role', 'dialog');
      viewer.setAttribute('aria-modal', 'true');
      viewer.innerHTML = '<div class="wf-viewer-window"><button type="button" class="wf-viewer-close" aria-label="Close">&times;</button></div>';
      document.body.appendChild(viewer);
      viewer.querySelector('.wf-viewer-close').addEventListener('click', closeLarger);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !viewer.hidden) closeLarger(); });
    }
    var win = viewer.querySelector('.wf-viewer-window');
    var old = win.querySelector('.wf-viewer-content');
    if (old) win.removeChild(old);
    content.classList.add('wf-viewer-content');
    win.classList.toggle('is-image', kind === 'image');
    win.appendChild(content);
    viewerFrom = from;
    viewer.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    viewer.querySelector('.wf-viewer-close').focus();
  }
  function openLarger(small, from) {
    var f = document.createElement('iframe');
    // Full size drops ?canvas and ?bare: the window shows the whole diagram page.
    f.src = small.getAttribute('src').replace(/\?.*$/, '');
    f.title = small.title;
    f.height = 420;
    f.setAttribute('scrolling', 'no');
    showInViewer(f, from, 'diagram');
    fitFrame(f);
  }
  function openImage(img) {
    var fig = document.createElement('figure');
    var big = document.createElement('img');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    fig.appendChild(big);
    var cap = img.closest('figure') && img.closest('figure').querySelector('figcaption');
    if (cap) fig.appendChild(cap.cloneNode(true));
    showInViewer(fig, img, 'image');
  }
  function closeLarger() {
    viewer.hidden = true;
    var c = viewer.querySelector('.wf-viewer-content');
    if (c) c.parentNode.removeChild(c);
    document.documentElement.style.overflow = '';
    if (viewerFrom) viewerFrom.focus();
  }

  // Sizes a diagram's frame to the diagram inside it.
  function fitFrame(f) {
    function fit() {
      var d;
      try { d = f.contentDocument; } catch (e) { return; }
      if (!d || !d.body || d.URL === 'about:blank' || d.getElementById('in-post')) return;
      var s = d.createElement('style');
      s.id = 'in-post';
      s.textContent = 'body{padding:0!important;background:transparent!important}';
      d.head.appendChild(s);
      var size = function () { f.style.height = Math.ceil(d.body.getBoundingClientRect().height) + 'px'; };
      new f.contentWindow.ResizeObserver(size).observe(d.body);
      size();
    }
    f.addEventListener('load', fit);
    if (f.contentDocument && f.contentDocument.readyState === 'complete') fit();
  }
})();
