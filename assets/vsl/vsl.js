/* Sparq Labs · /vsl, /booked, /not-a-fit — page behaviour. Config lives in window.SPARQ_VSL (assets/vsl/config.js). */
(function (w, d) {
  'use strict';
  var C = w.SPARQ_VSL || {};
  var T = C.tracking || {};
  var PAGE = w.SPARQ_PAGE || '/vsl';
  var debug = /[?&]debug=1\b/.test(w.location.search);
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('js');
  function $(s) { return d.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(d.querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return w.sessionStorage.getItem(k); w.sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- tracking: loads only what is configured ---------- */
  w.dataLayer = w.dataLayer || [];
  if (T.gtmId) {
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var g = d.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(T.gtmId); d.head.appendChild(g);
  }
  if (T.metaPixelId && !w.fbq) {
    (function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); })(w, d, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    w.fbq('init', T.metaPixelId);
    w.fbq('track', 'PageView');
  }
  var fired = {};
  function track(name, params, opts) {
    opts = opts || {};
    var key = 'sparq_vsl_' + name + (opts.key ? '_' + opts.key : '');
    if (!opts.repeat && (fired[key] || (opts.persist && store(key)))) return false;
    fired[key] = 1; if (opts.persist) store(key, '1');
    var id = 'sq-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    var p = Object.assign({ page: PAGE }, attribution(), params || {});
    w.dataLayer.push(Object.assign({ event: 'sparq_vsl_' + name.toLowerCase(), event_id: id }, p));
    // Direct Pixel conversions only when the Pixel was loaded here. If it lives in GTM, map these dataLayer events there.
    // Pixel base code + PageView live in each page's <head>. Only funnel events are sent from here.
    if (T.metaPixelId && w.fbq) {
      var px = params || {};
      if (name === 'Schedule') w.fbq('track', 'Schedule', {}, { eventID: id });                       // BookingCompleted
      if (name === 'Video50') w.fbq('track', 'ViewContent', { content_name: 'VSL' }, { eventID: id });
      if (name === 'ApplicationStarted') w.fbq('trackCustom', 'ApplicationStarted', {}, { eventID: id });
      if (name === 'ApplicationCompleted') {
        w.fbq('trackCustom', 'ApplicationCompleted', { qualified: !!px.qualified }, { eventID: id });
        if (px.qualified) w.fbq('track', 'Lead', { content_name: 'Pilot application' }, { eventID: id + '-lead' });
      }
      if (name === 'ContactClick') w.fbq('track', 'Contact', { method: px.method }, { eventID: id });
      if (name === 'BookingStarted') w.fbq('trackCustom', 'BookingStarted', { source: px.source }, { eventID: id });
    }
    if (debug) console.info('[sparq-vsl]', name, p);
    return true;
  }

  /* ---------- UTM / click-ID capture ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
  (function () {
    var q = new URLSearchParams(w.location.search), saved = {};
    try { saved = JSON.parse(store('sparq_vsl_attr') || '{}'); } catch (e) {}
    KEYS.forEach(function (k) { if (q.get(k)) saved[k] = q.get(k).slice(0, 200); });
    store('sparq_vsl_attr', JSON.stringify(saved));
  })();
  function attribution() { try { return JSON.parse(store('sparq_vsl_attr') || '{}'); } catch (e) { return {}; } }

  $$('[data-contact]').forEach(function (a) {
    a.addEventListener('click', function () { track('ContactClick', { method: a.getAttribute('data-contact') }, { repeat: true }); });
  });
  $$('[data-cta]').forEach(function (a) { a.addEventListener('click', function () { track('CtaClick', { cta: a.getAttribute('data-cta') }, { repeat: true }); }); });

  /* ---------- render content from config ---------- */
  function fill(sel, html) { var el = $(sel); if (el) el.innerHTML = html; }
  // Client marquee (getsparq.ai style): names separated by ✦, list doubled for a seamless loop.
  function marqRow(list) {
    var h = (list || []).map(function (n) { return '<span>' + esc(n) + '</span><i aria-hidden="true">✦</i>'; }).join('');
    var reps = Math.max(1, Math.ceil(12 / Math.max(1, (list || []).length)));   // short lists repeat so the row is wide enough
    var one = new Array(reps + 1).join(h);
    return one + one.replace(/<span>/g, '<span aria-hidden="true">');
  }
  fill('#clients-a', marqRow(C.clients));
  fill('#clients-b', marqRow(C.meetingsWith));

  var TOOL_NAMES = { 'ocean-io': 'Ocean.io', 'rb2b': 'RB2B', 'n8n': 'n8n', 'chatgpt': 'ChatGPT', 'hubspot': 'HubSpot', 'heyreach': 'HeyReach', 'emailbison': 'EmailBison', 'leadmagic': 'LeadMagic', 'bettercontact': 'BetterContact', 'builtwith': 'BuiltWith', 'linkedin': 'LinkedIn', 'gohighlevel': 'GoHighLevel', 'findymail': 'Findymail' };
  function toolName(t) { return TOOL_NAMES[t] || t.charAt(0).toUpperCase() + t.slice(1); }
  function toolRow(list) {
    var h = list.map(function (t) { return '<span class="tl"><img src="/assets/tools/' + esc(t) + '.png" alt="" width="32" height="32" loading="lazy" decoding="async">' + esc(toolName(t)) + '</span>'; }).join('');
    return h + h.replace(/<span class="tl">/g, '<span class="tl" aria-hidden="true">');
  }
  var tools = C.tools || [], half = Math.ceil(tools.length / 2);
  if (tools.length) { fill('#tools-a', toolRow(tools.slice(0, half))); fill('#tools-b', toolRow(tools.slice(half))); }

  fill('#cases', (C.cases || []).slice(0, 3).map(function (c, i) {
    return '<article class="case rv' + (i ? ' d' + i : '') + (c.featured ? ' feat' : '') + '"><div class="top"><b>' + esc(c.client) + '</b><span>' + esc(c.sector) + '</span></div>' +
      '<div class="big"><strong>' + esc(c.metric) + '</strong><em>' + esc(c.unit) + '</em></div>' +
      '<dl><dt>The problem</dt><dd>' + esc(c.problem) + '</dd><dt>What happened</dt><dd>' + esc(c.result) + '</dd></dl></article>';
  }).join(''));

  // Testimonials render only when real, approved quotes are in the config.
  (function () {
    var t = (C.testimonials || []).filter(function (x) { return x && x.quote && x.name; }), box = $('#testis');
    if (!box || !t.length) return;
    box.hidden = false;
    box.innerHTML = t.slice(0, 2).map(function (x) {
      return '<figure class="testi rv">' + (x.video ? '<div class="testi-v"><iframe src="' + esc(x.video) + '" title="Testimonial from ' + esc(x.name) + '" allowfullscreen loading="lazy"></iframe></div>' : '') +
        '<blockquote>“' + esc(x.quote) + '”</blockquote><figcaption>' + (x.photo ? '<img src="' + esc(x.photo) + '" alt="" width="48" height="48" loading="lazy">' : '<span class="tav" aria-hidden="true">' + esc(x.name.split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2)) + '</span>') +
        '<span><b>' + esc(x.name) + '</b>' + esc([x.role, x.company].filter(Boolean).join(', ')) + '</span>' +
        (x.linkedin ? '<a href="' + esc(x.linkedin) + '" target="_blank" rel="noopener" aria-label="' + esc(x.name) + ' on LinkedIn">in</a>' : '') + '</figcaption></figure>';
    }).join('');
  })();

  (function () {
    var sh = C.shot, el = $('#shot'); if (!el) return;
    if (!sh || !sh.src) { el.style.display = 'none'; return; }
    el.innerHTML = '<div class="shot-bar"><span class="mono">' + esc(sh.stat) + '</span></div><img src="' + esc(sh.src) + '" alt="Sending dashboard: ' + esc(sh.stat) + '" width="1400" height="618" loading="lazy" decoding="async"><figcaption>' + esc(sh.cap) + '</figcaption>';
  })();

  fill('#pricing', (C.pricing || []).map(function (p) {
    return '<div class="pr' + (p.hl ? ' hl' : '') + '"><span>' + esc(p.label) + '</span><b>' + esc(p.value) + '</b><small>' + esc(p.sub) + '</small></div>';
  }).join(''));

  fill('#people', (C.people || []).map(function (p, i) {
    var ph = p.photo ? '<div class="ph"><img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" width="600" height="600" loading="lazy" decoding="async"></div>'
                     : '<div class="ph ph-mono" aria-hidden="true"><span>' + esc(p.initials || (p.name || '?').charAt(0)) + '</span></div>';
    var tags = (p.tags || []).map(function (t) { return '<li>' + esc(t) + '</li>'; });
    if (p.linkedin) tags.push('<li class="li-chip"><a href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">LinkedIn →</a></li>');
    return '<article class="person rv' + (i ? ' d1' : '') + '">' + ph + '<div class="bd"><h3>' + esc(p.name) + '</h3><span class="role">' + esc(p.role) + '</span>' +
      (p.bio ? '<p>' + esc(p.bio) + '</p>' : '') + (tags.length ? '<ul class="ptags">' + tags.join('') + '</ul>' : '') + '</div></article>';
  }).join(''));

  fill('#more-cases', (C.moreCases || []).map(function (c, i) {
    return '<article class="mc rv' + (i % 3 ? ' d' + (i % 3) : '') + '"><div class="mc-top"><b>' + esc(c.client) + '</b><span>' + esc(c.sector) + '</span></div>' +
      '<div class="mc-big"><strong>' + esc(c.metric) + '</strong><em>' + esc(c.unit) + '</em></div><p>' + esc(c.note) + '</p></article>';
  }).join(''));
  if (!(C.moreCases || []).length) { var mg = $('#case-grid'); if (mg) mg.style.display = 'none'; }

  // FAQ: a question with an empty answer stays hidden until the answer is written. First one open.
  fill('#faq', (C.faq || []).filter(function (q) { return q[1]; }).map(function (q, i) {
    return '<details' + (i ? '' : ' open') + '><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>';
  }).join(''));

  /* ---------- signal feed ---------- */
  (function () {
    var list = $('#feed'), sig = C.signals || []; if (!list || !sig.length) return;
    var k = 0, mins = [2, 4, 7, 11, 16];
    function item(s, m) { return '<li><span class="feed-k">' + esc(s[0]) + '</span><span class="feed-t"><b>' + esc(s[1]) + '</b> ' + esc(s[2]) + '</span><span class="feed-s">' + m + 'm ago</span></li>'; }
    list.innerHTML = sig.slice(0, 5).map(function (s, j) { return item(s, mins[j]); }).join(''); k = 5;
    if (reduce) return;
    setInterval(function () {
      if (d.hidden) return;
      var li = d.createElement('div'); li.innerHTML = item(sig[k % sig.length], 'now').replace('now' + 'm ago', 'just now');
      list.insertBefore(li.firstChild, list.firstChild); k++;
      while (list.children.length > 5) list.removeChild(list.lastChild);
    }, 2600);
  })();

  /* ---------- scroll reveal, counters, bars ---------- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '', sep = el.hasAttribute('data-sep');
    var t0 = null, dur = 1400;
    function fmt(v) { var s = v.toFixed(dec); if (sep) s = Number(s).toLocaleString('en-IN'); return pre + s + suf; }
    if (reduce) { el.textContent = fmt(end); return; }
    function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / dur, 1); el.textContent = fmt(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add('in');
        el.querySelectorAll('[data-count]').forEach(countUp); if (el.hasAttribute('data-count')) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- scroll-linked: progress bar, engine line, sticky CTA ---------- */
  var hdr = $('.hdr'), bar = $('#progress'), steps = $('#steps'), stepEls = $$('.step'), sticky = $('#sticky');
  var bookEls = [$('#book'), $('#apply')], heroEnd = $('#hero-end'), fab = $('#fab');
  var desktopView = !w.matchMedia || w.matchMedia('(min-width: 900px)').matches;
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = w.scrollY, h = d.documentElement.scrollHeight - w.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (hdr) { var el = d.elementFromPoint(w.innerWidth / 2, 90); var dark = el && el.closest && el.closest('.hero,.dark'); hdr.classList.toggle('on-light', !dark); }
    if (steps) {
      var r = steps.getBoundingClientRect(), mid = w.innerHeight * 0.6;
      var f = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      steps.style.setProperty('--fill', f.toFixed(3));
      stepEls.forEach(function (s) { s.classList.toggle('on', s.getBoundingClientRect().top < mid); });
    }
    if (sticky && heroEnd) {
      var past = heroEnd.getBoundingClientRect().bottom < 0;
      var inBook = bookEls.some(function (b) { if (!b) return false; var br = b.getBoundingClientRect(); return br.top < w.innerHeight * 0.8 && br.bottom > w.innerHeight * 0.2; });
      sticky.classList.toggle('show', past && !inBook);
    }
    if (fab) {
      var calOpen = bookEls.some(function (b) {
        // Desktop: the form has room beside the buttons; only step aside for a calendar. Phones: step aside for the form too.
        if (!b || (b.id === 'apply' && desktopView && !b.classList.contains('is-booking'))) return false;
        var br = b.getBoundingClientRect(); return br.top < w.innerHeight * 0.85 && br.bottom > w.innerHeight * 0.15;
      });
      fab.classList.toggle('away', calOpen);
      fab.classList.toggle('lift', !!(sticky && sticky.classList.contains('show')));
    }
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  w.addEventListener('resize', onScroll); onScroll();
  w.SPARQ_REFRESH = onScroll;

  /* ---------- VSL ---------- */
  function embedUrl(u) {
    var m;
    if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-z0-9]+))?/i))) {
      var h = (u.match(/[?&]h=([a-z0-9]+)/i) || [])[1] || m[2];
      return 'https://player.vimeo.com/video/' + m[1] + '?playsinline=1' + (h ? '&h=' + h : '');
    }
    if ((m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/))) return 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0&playsinline=1&modestbranding=1&enablejsapi=1&origin=' + encodeURIComponent(w.location.origin);
    if ((m = u.match(/loom\.com\/(?:share|embed)\/([a-z0-9]+)/i))) return 'https://www.loom.com/embed/' + m[1] + '?';
    // Google Drive: the file must be shared as "Anyone with the link". Drive's player has no autoplay or progress API.
    if ((m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/))) return 'https://drive.google.com/file/d/' + m[1] + '/preview?';
    if ((m = u.match(/wistia\.(?:com|net)\/(?:medias|embed\/iframe)\/([a-z0-9]+)/i))) return 'https://fast.wistia.net/embed/iframe/' + m[1] + '?';
    return '';
  }
  // YouTube: ask the player for status updates, then fire VideoPlay, Video50 (Pixel ViewContent) and VideoPastPricing.
  function ytProgress(ifr) {
    if (!ifr) return;
    var hello = function () { try { ifr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'sparq-vsl', channel: 'widget' }), '*'); } catch (e) {} };
    ifr.addEventListener('load', function () { hello(); setTimeout(hello, 1000); });
    w.addEventListener('message', function (e) {
      if (!/youtube(-nocookie)?\.com$/.test((e.origin || '').replace(/^https?:\/\//, '').replace(/^www\./, ''))) return;
      var m; try { m = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
      var info = m && m.info; if (!info || typeof info !== 'object') return;
      if (info.playerState === 1) track('VideoPlay');
      var t = info.currentTime, dur = info.duration || ytProgress.dur;
      if (info.duration) ytProgress.dur = info.duration;
      if (typeof t === 'number' && t > 0) {
        if (dur && t / dur >= 0.5) track('Video50');
        if (t >= (T.pricingSecond || 240)) track('VideoPastPricing');
      }
    });
  }
  var frame = $('#vsl-frame'), url = (C.videoUrl || '').trim();
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
  if (frame) {
    if (!url) {
      // No video yet: thumbnail only (Nish + title). No play button, no placeholder text.
      frame.innerHTML = '<div class="vsl-ph vsl-thumb" role="img" aria-label="' + esc(C.videoTitle || '') + '"><img src="' + esc(C.videoPoster || '/assets/founder.jpg') + '" alt="" width="1280" height="720"><div class="vsl-thumb-t"><b>' + esc(C.videoTitle || '') + '</b><small>Full breakdown · Nishkarsh Agarwal</small></div></div>';
    } else if (/\.mp4(\?|$)/i.test(url)) {
      frame.innerHTML = '<video controls playsinline preload="metadata"' + (C.videoPoster ? ' poster="' + esc(C.videoPoster) + '"' : '') + '><source src="' + esc(url) + '" type="video/mp4"></video>';
      var v = frame.querySelector('video');
      v.addEventListener('play', function () { track('VideoPlay'); }, { once: true });
      v.addEventListener('timeupdate', function () {
        if (v.duration && v.currentTime / v.duration >= 0.5) track('Video50');
        if (v.currentTime >= (T.pricingSecond || 240)) track('VideoPastPricing');
      });
    } else {
      var src = embedUrl(url);
      var load = function (auto) {
        var s = src + (auto ? (/[?&]$/.test(src) ? '' : '&') + (src.indexOf('wistia') > -1 ? 'autoPlay=true' : 'autoplay=1') : '');
        frame.innerHTML = '<div class="vsl-loading" role="status"><i></i><span>Loading the video…</span></div>' +
          '<iframe src="' + esc(s) + '" title="Sparq Labs VSL: ' + esc(C.videoTitle || '') + '" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>';
        var ifr = frame.querySelector('iframe'), ok = false;
        ifr.addEventListener('load', function () { ok = true; frame.classList.add('ready'); });
        // Error fallback: if the player hasn't loaded in 12 s (blocked, offline, removed video), offer the direct link.
        setTimeout(function () {
          if (ok) return;
          frame.insertAdjacentHTML('beforeend', '<div class="vsl-err"><b>The video is taking a while to load.</b><a href="' + esc(url) + '" target="_blank" rel="noopener">Watch it on the video page →</a></div>');
        }, 12000);
        if (s.indexOf('youtube') > -1) ytProgress(ifr);
      };
      if (!src) frame.innerHTML = '<div class="vsl-ph"><b>Unsupported video URL</b><small>Use Vimeo, YouTube, Loom, Wistia or .mp4</small></div>';
      else if (!C.videoPoster) { load(false); w.addEventListener('blur', function () { if (d.activeElement && d.activeElement.tagName === 'IFRAME' && frame.contains(d.activeElement)) track('VideoPlay'); }); }
      else {
        // 'youtube' poster = the thumbnail set in YouTube Studio. It already carries its own text, so no title overlay.
        var ytId = (url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/) || [])[1];
        var ytPoster = C.videoPoster === 'youtube' && ytId;
        var posterSrc = ytPoster ? 'https://i.ytimg.com/vi/' + ytId + '/maxresdefault.jpg' : C.videoPoster;
        frame.innerHTML = '<img class="vsl-poster' + (ytPoster ? ' yt' : '') + '" src="' + esc(posterSrc) + '" alt="" width="1280" height="720" fetchpriority="high">' +
          '<button class="vsl-play" type="button" aria-label="Play the video: ' + esc(C.videoTitle || 'Sparq Labs') + '"><span>' + PLAY + '</span></button>' +
          (ytPoster ? '' : '<div class="vsl-poster-t" aria-hidden="true"><b>' + esc(C.videoTitle || '') + '</b><small>Watch first · ~6 min · Nishkarsh Agarwal</small></div>');
        if (ytPoster) {
          // YouTube returns a 120×90 grey placeholder (not an error) when no max-res thumbnail exists.
          var pimg = frame.querySelector('.vsl-poster'), swap = function () { pimg.src = 'https://i.ytimg.com/vi/' + ytId + '/hqdefault.jpg'; };
          pimg.addEventListener('load', function () { if (pimg.naturalWidth <= 120 && pimg.src.indexOf('maxres') > -1) swap(); });
          pimg.addEventListener('error', function () { if (pimg.src.indexOf('maxres') > -1) swap(); });
        }
        frame.querySelector('.vsl-play').addEventListener('click', function () { track('VideoPlay'); load(true); });
      }
    }
  }

  /* ---------- Cal.com inline embeds (two namespaces, one script) ---------- */
  var link = (C.bookingLink || '').replace(/^https?:\/\/(app\.)?cal\.com\//, '');
  $$('.js-cal-link').forEach(function (a) {
    if (!link) { a.removeAttribute('href'); return; }
    var q = new URLSearchParams(attribution()).toString();
    a.href = 'https://cal.com/' + link + (q ? '?' + q : '');
    a.addEventListener('click', function () { track('BookingLinkClick', {}, { repeat: true }); });
  });
  // Mobile: never embed (Cal renders an empty white box). The "Open the calendar" button shows instead.
  var desktop = !w.matchMedia || w.matchMedia('(min-width: 900px)').matches;
  function loadCal() {
    if (w.Cal && w.Cal.loaded !== undefined) return;
    (function (C2, A, L) { var p = function (a, ar) { a.q.push(ar); }; var doc = C2.document; C2.Cal = C2.Cal || function () { var cal = C2.Cal; var ar = arguments;
      if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; doc.head.appendChild(doc.createElement('script')).src = A; cal.loaded = true; }
      if (ar[0] === L) { var api = function () { p(api, arguments); }; var ns = ar[1]; api.q = api.q || [];
        if (typeof ns === 'string') { cal.ns[ns] = cal.ns[ns] || api; p(cal.ns[ns], ar); p(cal, ['initNamespace', ns]); } else p(cal, ar); return; }
      p(cal, ar); }; })(w, 'https://app.cal.com/embed/embed.js', 'init');
  }
  // Mounts Nish's event inline. `prefill` (name, email, notes, ...) is passed to Cal.com as booking-form values.
  function mountCal(el, prefill, onBooked) {
    if (!link || !el || el.dataset.mounted) return false;
    loadCal();
    el.dataset.mounted = '1'; el.innerHTML = '';
    var ns = el.getAttribute('data-ns') || ('sparq-' + el.id);
    w.Cal('init', ns, { origin: 'https://cal.com' });
    w.Cal.ns[ns]('inline', { elementOrSelector: '#' + el.id, calLink: link, config: Object.assign({ layout: 'month_view' }, attribution(), prefill || {}) });
    w.Cal.ns[ns]('ui', { hideEventTypeDetails: false, layout: 'month_view', cssVarsPerTheme: { light: { 'cal-brand': '#2E77FC' }, dark: { 'cal-brand': '#2E77FC' } } });
    // One Schedule (BookingCompleted) conversion per session, whichever calendar the visitor books in.
    w.Cal.ns[ns]('on', { action: 'bookingSuccessful', callback: function () { track('Schedule', { embed: ns }, { persist: true }); if (onBooked) onBooked(); } });
    w.Cal.ns[ns]('on', { action: 'linkFailed', callback: function () {
      el.innerHTML = '<div class="cal-loading">The calendar didn\'t load. <a href="' + esc(calUrl(prefill)) + '" target="_blank" rel="noopener">Open the booking page →</a></div>';
    } });
    return true;
  }
  function calUrl(prefill) {
    var q = new URLSearchParams(Object.assign({}, attribution(), prefill || {})).toString();
    return 'https://cal.com/' + link + (q ? '?' + q : '');
  }
  w.SPARQ = { track: track, attribution: attribution, mountCal: mountCal, calUrl: calUrl, desktop: desktop, esc: esc };
  if (link && desktop) {
    var mount = function (el) { if (mountCal(el)) track('BookingStarted', { source: 'book-section' }); };
    var cals = $$('.cal-embed[data-auto]');
    cals.forEach(function (el) { el.innerHTML = '<div class="cal-loading">Loading Nish\'s calendar…</div>'; });
    if ('IntersectionObserver' in w) {
      var cio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { mount(e.target); cio.unobserve(e.target); } }); }, { rootMargin: '700px 0px' });
      cals.forEach(function (el) { cio.observe(el); });
    } else cals.forEach(mount);
  } else {
    if (!link) $$('.cal-embed[data-auto]').forEach(function (el) { el.innerHTML = '<div class="cal-loading">Booking embed · set bookingLink in the page config</div>'; });
  }

  track('PageView');
  // Cal.com redirects here after a booking (set the redirect in the Cal.com event settings).
  // Covers mobile visitors who book on the Cal.com page instead of the embed. Once per session.
  if (PAGE === '/booked') track('Schedule', { source: 'confirmation_page' }, { persist: true });
})(window, document);
