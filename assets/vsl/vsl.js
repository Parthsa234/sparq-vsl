/* Sparq Labs · /vsl — page behaviour. Config lives in window.SPARQ_VSL (bottom of vsl.html). */
(function (w, d) {
  'use strict';
  var C = w.SPARQ_VSL || {};
  var T = C.tracking || {};
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
    var p = Object.assign({ page: '/vsl' }, attribution(), params || {});
    w.dataLayer.push(Object.assign({ event: 'sparq_vsl_' + name.toLowerCase(), event_id: id }, p));
    // Direct Pixel conversions only when the Pixel was loaded here. If it lives in GTM, map these dataLayer events there.
    if (T.metaPixelId && w.fbq) {
      if (name === 'Schedule') w.fbq('track', 'Schedule', {}, { eventID: id });
      if (name === 'VideoPlay') w.fbq('track', 'ViewContent', { content_name: 'VSL' }, { eventID: id });
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

  $$('[data-cta]').forEach(function (a) { a.addEventListener('click', function () { track('CtaClick', { cta: a.getAttribute('data-cta') }, { repeat: true }); }); });

  /* ---------- render content from config ---------- */
  function fill(sel, html) { var el = $(sel); if (el) el.innerHTML = html; }
  var logoHtml = (C.logos || []).map(function (n) {
    var o = typeof n === 'string' ? { name: n } : n;
    return '<span class="lg">' + (o.src ? '<img src="' + esc(o.src) + '" alt="' + esc(o.name) + '" loading="lazy">' : esc(o.name)) + '</span>';
  }).join('');
  fill('#logos', logoHtml + logoHtml.replace(/<span class="lg">/g, '<span class="lg" aria-hidden="true">'));

  var tools = C.tools || [], half = Math.ceil(tools.length / 2);
  function toolName(t) { var m = { 'ocean-io': 'Ocean.io', 'rb2b': 'RB2B', 'n8n': 'n8n', 'chatgpt': 'ChatGPT', 'hubspot': 'HubSpot', 'heyreach': 'HeyReach', 'emailbison': 'EmailBison', 'leadmagic': 'LeadMagic', 'bettercontact': 'BetterContact', 'builtwith': 'BuiltWith', 'linkedin': 'LinkedIn' }; return m[t] || t.charAt(0).toUpperCase() + t.slice(1); }
  function toolRow(list) { var h = list.map(function (t) { return '<span class="tl"><img src="/assets/tools/' + esc(t) + '.png" alt="" width="28" height="28" loading="lazy" decoding="async">' + esc(toolName(t)) + '</span>'; }).join(''); return h + h.replace(/<span class="tl">/g, '<span class="tl" aria-hidden="true">'); }
  fill('#tools-a', toolRow(tools.slice(0, half)));
  fill('#tools-b', toolRow(tools.slice(half)));

  fill('#cases', (C.cases || []).map(function (c, i) {
    return '<article class="case rv' + (i % 3 ? ' d' + (i % 3) : '') + (c.featured ? ' feat' : '') + '"><div class="top"><b>' + esc(c.client) + '</b><span>' + esc(c.sector) + '</span></div>' +
      '<div class="big"><strong>' + esc(c.metric) + '</strong><em>' + esc(c.unit) + '</em></div>' +
      '<dl><dt>The problem</dt><dd>' + esc(c.problem) + '</dd><dt>What happened</dt><dd>' + esc(c.result) + '</dd></dl></article>';
  }).join(''));

  var maxBar = Math.max.apply(null, (C.bars || [{ v: 1 }]).map(function (b) { return b.v; })) * 1.3;
  fill('#bars', (C.bars || []).map(function (b) {
    return '<div class="bar' + (b.hl ? ' hl' : '') + '"><em>' + b.v + '%</em><i data-h="' + (b.v / maxBar * 100).toFixed(1) + '"></i><small>' + esc(b.label) + '<br>' + esc(b.sub) + '</small></div>';
  }).join(''));

  fill('#pricing', (C.pricing || []).map(function (p) {
    return '<div class="pr' + (p.hl ? ' hl' : '') + '"><span>' + esc(p.label) + '</span><b>' + esc(p.value) + '</b><small>' + esc(p.sub) + '</small></div>';
  }).join(''));

  fill('#people', (C.people || []).map(function (p, i) {
    var ph = p.photo ? '<div class="ph"><img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" width="600" height="600" loading="lazy" decoding="async"></div>'
                     : '<div class="ph ph-mono" aria-hidden="true"><span>' + esc(p.initials || (p.name || '?').charAt(0)) + '</span></div>';
    var bio = p.bio ? '<p>' + esc(p.bio) + '</p>' : '<p class="todo">Profile coming soon.</p>';
    var tags = (p.tags || []).length ? '<ul class="ptags">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '';
    var li = p.linkedin ? '<a class="plink" href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">LinkedIn →</a>' : '';
    return '<article class="person rv' + (i ? ' d1' : '') + '">' + ph + '<div class="bd"><h3>' + esc(p.name) + '</h3><span class="role">' + esc(p.role) + '</span>' + bio + tags + li + '</div></article>';
  }).join(''));

  /* ---------- screenshot viewer ---------- */
  (function () {
    var shots = C.shots || [], stage = $('#vw-stage'); if (!stage || !shots.length) return;
    stage.innerHTML = shots.map(function (s, i) { return '<img src="' + esc(s.src) + '" alt="Sending dashboard: ' + esc(s.stat) + '" width="1400" height="618"' + (i ? ' loading="lazy"' : '') + ' decoding="async">'; }).join('');
    var imgs = stage.querySelectorAll('img'), i = 0, timer;
    function show(n) {
      i = (n + shots.length) % shots.length;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      $('#vw-n').textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + shots.length).slice(-2);
      $('#vw-cap').textContent = shots[i].cap; $('#vw-stat').textContent = shots[i].stat;
    }
    function auto() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(i + 1); }, 4500); }
    $$('#viewer [data-step]').forEach(function (b) { b.addEventListener('click', function () { show(i + +b.getAttribute('data-step')); auto(); }); });
    show(0); auto();
  })();

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
        el.querySelectorAll('.bar i').forEach(function (b) { b.style.height = b.getAttribute('data-h') + '%'; });
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
    $$('.stat b[data-count], .guarantee b[data-count]').forEach(function (el) { if (!el.closest('.rv')) io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); $$('.bar i').forEach(function (b) { b.style.height = b.getAttribute('data-h') + '%'; }); }

  /* ---------- scroll-linked: progress bar, engine line, sticky CTA ---------- */
  var hdr = $('.hdr'), bar = $('#progress'), steps = $('#steps'), stepEls = $$('.step'), sticky = $('#sticky');
  var bookEls = [$('#book'), $('#book-final')], heroEnd = $('.stats');
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
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  w.addEventListener('resize', onScroll); onScroll();

  /* ---------- VSL ---------- */
  function embedUrl(u) {
    var m;
    if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-z0-9]+))?/i))) {
      var h = (u.match(/[?&]h=([a-z0-9]+)/i) || [])[1] || m[2];
      return 'https://player.vimeo.com/video/' + m[1] + '?playsinline=1' + (h ? '&h=' + h : '');
    }
    if ((m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/))) return 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0&playsinline=1';
    if ((m = u.match(/loom\.com\/(?:share|embed)\/([a-z0-9]+)/i))) return 'https://www.loom.com/embed/' + m[1] + '?';
    if ((m = u.match(/wistia\.(?:com|net)\/(?:medias|embed\/iframe)\/([a-z0-9]+)/i))) return 'https://fast.wistia.net/embed/iframe/' + m[1] + '?';
    return '';
  }
  var frame = $('#vsl-frame'), url = (C.videoUrl || '').trim();
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
  if (frame) {
    if (!url) {
      frame.innerHTML = '<div class="vsl-ph" role="img" aria-label="Video placeholder"><span class="pb">' + PLAY + '</span><b>How we put qualified calls on your calendar</b><small>VSL video goes here · set videoUrl in the page config</small></div>';
    } else if (/\.mp4(\?|$)/i.test(url)) {
      frame.innerHTML = '<video controls playsinline preload="metadata"' + (C.videoPoster ? ' poster="' + esc(C.videoPoster) + '"' : '') + '><source src="' + esc(url) + '" type="video/mp4"></video>';
      frame.querySelector('video').addEventListener('play', function () { track('VideoPlay'); }, { once: true });
    } else {
      var src = embedUrl(url);
      var load = function (auto) {
        var s = src + (auto ? (/[?&]$/.test(src) ? '' : '&') + (src.indexOf('wistia') > -1 ? 'autoPlay=true' : 'autoplay=1') : '');
        frame.innerHTML = '<iframe src="' + esc(s) + '" title="Sparq Labs VSL" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>';
      };
      if (!src) frame.innerHTML = '<div class="vsl-ph"><b>Unsupported video URL</b><small>Use Vimeo, YouTube, Loom, Wistia or .mp4</small></div>';
      else if (!C.videoPoster) { load(false); w.addEventListener('blur', function () { if (d.activeElement && d.activeElement.tagName === 'IFRAME' && frame.contains(d.activeElement)) track('VideoPlay'); }); }
      else {
        frame.innerHTML = '<img class="vsl-poster" src="' + esc(C.videoPoster) + '" alt="" width="1280" height="720"><button class="vsl-play" type="button" aria-label="Play the Sparq Labs video"><span>' + PLAY + '</span></button>';
        frame.querySelector('.vsl-play').addEventListener('click', function () { track('VideoPlay'); load(true); });
      }
    }
  }

  /* ---------- Cal.com inline embeds (two namespaces, one script) ---------- */
  var link = (C.bookingLink || '').replace(/^https?:\/\/(app\.)?cal\.com\//, '');
  $$('.js-cal-link').forEach(function (a) {
    if (!link) { a.parentNode.textContent = 'Booking link not configured yet.'; return; }
    var q = new URLSearchParams(attribution()).toString();
    a.href = 'https://cal.com/' + link + (q ? '?' + q : '');
    a.addEventListener('click', function () { track('BookingLinkClick'); });
  });
  if (link) {
    (function (C2, A, L) { var p = function (a, ar) { a.q.push(ar); }; var doc = C2.document; C2.Cal = C2.Cal || function () { var cal = C2.Cal; var ar = arguments;
      if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; doc.head.appendChild(doc.createElement('script')).src = A; cal.loaded = true; }
      if (ar[0] === L) { var api = function () { p(api, arguments); }; var ns = ar[1]; api.q = api.q || [];
        if (typeof ns === 'string') { cal.ns[ns] = cal.ns[ns] || api; p(cal.ns[ns], ar); p(cal, ['initNamespace', ns]); } else p(cal, ar); return; }
      p(cal, ar); }; })(w, 'https://app.cal.com/embed/embed.js', 'init');
    var mount = function (el) {
      if (el.dataset.mounted) return; el.dataset.mounted = '1'; el.innerHTML = '';
      var ns = el.getAttribute('data-ns');
      w.Cal('init', ns, { origin: 'https://cal.com' });
      w.Cal.ns[ns]('inline', { elementOrSelector: '#' + el.id, calLink: link, config: Object.assign({ layout: 'month_view' }, attribution()) });
      w.Cal.ns[ns]('ui', { hideEventTypeDetails: false, layout: 'month_view', cssVarsPerTheme: { light: { 'cal-brand': '#2E77FC' }, dark: { 'cal-brand': '#2E77FC' } } });
      // One Schedule conversion per session, whichever embed the visitor books in.
      w.Cal.ns[ns]('on', { action: 'bookingSuccessful', callback: function () { track('Schedule', { embed: ns }, { persist: true }); } });
    };
    var cals = $$('.cal-embed');
    cals.forEach(function (el) { el.innerHTML = '<div class="cal-loading">Loading Nish\'s calendar…</div>'; });
    if ('IntersectionObserver' in w) {
      var cio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { mount(e.target); cio.unobserve(e.target); } }); }, { rootMargin: '700px 0px' });
      cals.forEach(function (el) { cio.observe(el); });
    } else cals.forEach(mount);
  } else {
    $$('.cal-embed').forEach(function (el) { el.innerHTML = '<div class="cal-loading">Booking embed · set bookingLink in the page config</div>'; });
  }

  track('PageView');
})(window, document);
