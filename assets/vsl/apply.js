/* Sparq Labs · /vsl — Contact-us application → Cal.com booking.
   Questions, options and routing come from SPARQ_VSL.application (assets/vsl/config.js).
   Flow: step 1 (about you) → step 2 (your agency) → qualified: Nish's calendar inline, prefilled
   (desktop) or a prefilled booking-page button (mobile) · not a fit: /not-a-fit.
   Answers live in memory only: never in localStorage/sessionStorage, never sent to the Pixel. */
(function (w, d) {
  'use strict';
  var C = w.SPARQ_VSL || {}, A = C.application || {}, S = w.SPARQ;
  var root = d.getElementById('apply-body'), box = d.getElementById('apply');
  if (!root || !S || !(A.steps || []).length) return;
  var esc = S.esc, steps = A.steps, started = false, submitting = false;

  /* ---------- render ---------- */
  function fieldHtml(f) {
    var id = 'ap-' + f.id, err = '<p class="fld-err" id="' + id + '-err" aria-live="polite"></p>';
    var opt = f.required ? '' : ' <em>(optional)</em>';
    if (f.type === 'choice') {
      return '<fieldset class="fld fld-choice" data-id="' + f.id + '" aria-describedby="' + id + '-err"><legend>' + esc(f.label) + opt + '</legend><div class="opts">' +
        f.options.map(function (o, i) {
          return '<label class="opt"><input type="radio" name="' + f.id + '" value="' + esc(o) + '" id="' + id + '-' + i + '"' + (f.required ? ' required' : '') + '><span>' + esc(o) + '</span></label>';
        }).join('') + '</div>' + err + '</fieldset>';
    }
    var common = ' id="' + id + '" name="' + f.id + '"' + (f.required ? ' required aria-required="true"' : '') +
      (f.autocomplete ? ' autocomplete="' + f.autocomplete + '"' : '') + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
      ' aria-describedby="' + id + '-err"';
    var input = f.type === 'textarea' ? '<textarea rows="3"' + common + '></textarea>'
      : '<input type="' + (f.type === 'url' ? 'text' : f.type) + '"' + common + (f.type === 'url' ? ' inputmode="url"' : '') + (f.type === 'tel' ? ' inputmode="tel"' : '') + '>';
    if (f.prefix) input = '<div class="in-pre"><span aria-hidden="true">' + esc(f.prefix) + '</span>' + input + '</div>';
    return '<div class="fld" data-id="' + f.id + '"><label for="' + id + '">' + esc(f.label) + opt + '</label>' + input + err + '</div>';
  }
  root.innerHTML =
    '<form id="apply-form" class="apply-form" novalidate>' +
      '<ol class="apply-steps" aria-label="Application progress">' + steps.map(function (s, i) {
        return '<li' + (i ? '' : ' class="on" aria-current="step"') + '><b>' + (i + 1) + '</b>' + esc(s.title) + '</li>';
      }).join('') + '</ol>' +
      steps.map(function (s, i) {
        var last = i === steps.length - 1;
        return '<div class="apply-step" data-step="' + i + '"' + (i ? ' hidden' : '') + ' role="group" aria-label="Step ' + (i + 1) + ' of ' + steps.length + ': ' + esc(s.title) + '">' +
          '<div class="fld-grid' + (i ? ' wide' : '') + '">' + s.fields.map(fieldHtml).join('') + '</div>' +
          '<div class="apply-actions">' + (i ? '<button type="button" class="btn btn-line" data-back>← Back</button>' : '<span></span>') +
          (last ? '<button type="submit" class="btn btn-blue btn-lg nudge" data-submit>Submit application <span class="ar">→</span></button>'
                : '<button type="button" class="btn btn-blue btn-lg" data-next>Continue <span class="ar">→</span></button>') +
          '</div></div>';
      }).join('') +
      '<p class="apply-alert" role="alert" hidden></p>' +
      '<p class="apply-privacy">Your answers are only used to prepare for the call and are attached to your booking.</p>' +
    '</form>';

  var form = d.getElementById('apply-form');
  var stepEls = form.querySelectorAll('.apply-step'), dots = form.querySelectorAll('.apply-steps li'), alertEl = form.querySelector('.apply-alert');
  var current = 0;

  /* ---------- validation ---------- */
  function fieldDef(id) { for (var i = 0; i < steps.length; i++) for (var j = 0; j < steps[i].fields.length; j++) if (steps[i].fields[j].id === id) return steps[i].fields[j]; }
  function value(f) {
    if (f.type === 'choice') { var c = form.querySelector('input[name="' + f.id + '"]:checked'); return c ? c.value : ''; }
    var el = form.elements[f.id]; return el ? String(el.value || '').trim() : '';
  }
  function check(f) {
    var v = value(f);
    if (!v) return f.required ? (f.type === 'choice' ? 'Please choose one.' : 'Please fill this in.') : '';
    if (f.type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter a valid email address.';
      var dom = v.split('@')[1].toLowerCase();
      if (f.workEmail && (A.blockedEmailDomains || []).indexOf(dom) > -1) return 'Please use your work email, not a personal Gmail, Yahoo or Outlook address.';
    }
    if (f.type === 'tel') { var n = v.replace(/[^\d]/g, ''); if (n.length < 7 || n.length > 15) return 'Please enter a valid WhatsApp number.'; }
    if (f.type === 'url' && !/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v)) return 'Please enter your agency’s website, e.g. youragency.com.';
    return '';
  }
  function show(f, msg) {
    var wrap = form.querySelector('[data-id="' + f.id + '"]'), err = d.getElementById('ap-' + f.id + '-err');
    if (err) err.textContent = msg;
    if (wrap) wrap.classList.toggle('bad', !!msg);
    var inputs = wrap ? wrap.querySelectorAll('input,textarea') : [];
    Array.prototype.forEach.call(inputs, function (i) { if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); });
  }
  function validateStep(i) {
    var firstBad = null;
    steps[i].fields.forEach(function (f) {
      var msg = check(f); show(f, msg);
      if (msg && !firstBad) firstBad = form.querySelector('[data-id="' + f.id + '"] input, [data-id="' + f.id + '"] textarea');
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  // Show a field's error when the visitor leaves it, but not when focus is moving to a form button:
  // that button validates anyway, and changing the layout mid-click would move the button away from the cursor.
  form.addEventListener('blur', function (e) {
    var name = e.target && e.target.name, f = name && fieldDef(name);
    var to = e.relatedTarget; if (to && to.closest && to.closest('[data-next],[data-back],[data-submit]')) return;
    if (f && f.type !== 'choice' && value(f)) show(f, check(f));
  }, true);
  // Clear an error as soon as the value becomes valid (while typing), so nothing shifts on blur.
  form.addEventListener('input', function (e) {
    var f = e.target && fieldDef(e.target.name), wrap = f && form.querySelector('[data-id="' + f.id + '"]');
    if (wrap && wrap.classList.contains('bad') && !check(f)) show(f, '');
  });
  form.addEventListener('change', function (e) { var f = e.target && fieldDef(e.target.name); if (f && f.type === 'choice') show(f, ''); });
  function begin() { if (!started) { started = true; S.track('ApplicationStarted'); } }
  form.addEventListener('input', begin);
  form.addEventListener('change', begin);

  /* ---------- steps ---------- */
  function go(i) {
    current = i;
    Array.prototype.forEach.call(stepEls, function (el, k) { el.hidden = k !== i; });
    Array.prototype.forEach.call(dots, function (el, k) { el.classList.toggle('on', k <= i); if (k === i) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current'); });
    var first = stepEls[i].querySelector('input,textarea'); if (first) first.focus({ preventScroll: true });
    var top = box.getBoundingClientRect().top; if (top < 0 || top > w.innerHeight * 0.6) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  form.addEventListener('click', function (e) {
    if (e.target.closest('[data-next]')) { if (validateStep(current)) go(current + 1); }
    if (e.target.closest('[data-back]')) go(current - 1);
  });

  /* ---------- submit ---------- */
  function collect() {
    var out = {};
    steps.forEach(function (s) { s.fields.forEach(function (f) {
      var v = value(f);
      if (f.type === 'tel' && v && v.charAt(0) !== '+' && f.prefix) v = f.prefix + ' ' + v;
      if (f.type === 'url' && v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
      out[f.id] = v;
    }); });
    return out;
  }
  function qualifies(ans) {
    return !steps.some(function (s) { return s.fields.some(function (f) { return (f.disqualify || []).indexOf(ans[f.id]) > -1; }); });
  }
  function notes(ans) {
    var lines = ['Pilot application (VSL page)'];
    steps.forEach(function (s) { s.fields.forEach(function (f) {
      if (f.id === 'name' || f.id === 'email' || !ans[f.id]) return;
      lines.push(f.label + (/[?]$/.test(f.label) ? ' ' : ': ') + ans[f.id]);
    }); });
    return lines.join('\n');
  }
  function send(ans, ok) {
    if (!A.endpoint) return Promise.resolve();
    var body = JSON.stringify({ submitted_at: new Date().toISOString(), qualified: ok, answers: ans, attribution: S.attribution(), page: w.location.pathname });
    var timeout = new Promise(function (r) { setTimeout(r, 4000); });
    var req = w.fetch ? fetch(A.endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body, keepalive: true }).catch(function () {}) : Promise.resolve();
    return Promise.race([req, timeout]);
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;                                   // duplicate-submission guard
    if (!validateStep(current)) return;
    for (var i = 0; i < steps.length; i++) if (!validateStep(i)) { go(i); validateStep(i); return; }
    submitting = true;
    var btn = form.querySelector('[data-submit]');
    btn.disabled = true; btn.classList.add('busy'); btn.innerHTML = 'Submitting…';
    alertEl.hidden = true;
    var ans = collect(), ok = qualifies(ans);
    S.track('ApplicationCompleted', { qualified: ok });
    send(ans, ok).then(function () {
      if (!ok) { w.location.href = '/not-a-fit'; return; }
      booking(ans);
    }).catch(function () {
      submitting = false; btn.disabled = false; btn.classList.remove('busy'); btn.innerHTML = 'Submit application <span class="ar">→</span>';
      alertEl.textContent = 'Something went wrong. Please try again, or call us on ' + ((C.contact || {}).display || '') + '.'; alertEl.hidden = false;
    });
  });

  /* ---------- qualified: Nish's calendar, prefilled ---------- */
  function booking(ans) {
    var prefill = { name: ans.name, email: ans.email, notes: notes(ans) };
    var first = String(ans.name || '').split(' ')[0];
    box.classList.add('is-booking');
    root.innerHTML =
      '<div class="apply-ok" role="status" tabindex="-1"><i aria-hidden="true">✓</i><div><b>Thanks' + (first ? ', ' + esc(first) : '') + '. You qualify for a pilot call.</b>' +
      '<span>Pick a time with Nishkarsh below. Your answers are already attached to the booking.</span></div></div>' +
      (S.desktop
        ? '<div class="cal-shell apply-cal"><div class="cal-embed" id="apply-cal" data-ns="sparq-apply"><div class="cal-loading">Loading Nish\'s calendar…</div></div>' +
          '<p class="cal-fallback">Calendar not loading? <a href="' + esc(S.calUrl(prefill)) + '" target="_blank" rel="noopener" data-cal-out>Open the booking page →</a></p></div>'
        : '<a class="btn btn-blue btn-lg apply-open" href="' + esc(S.calUrl(prefill)) + '" target="_blank" rel="noopener" data-cal-out>Open Nish\'s calendar <span class="ar">→</span></a>' +
          '<p class="apply-privacy">Opens the booking page with your details filled in.</p>');
    var ok = root.querySelector('.apply-ok'); if (ok) ok.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    root.querySelectorAll('[data-cal-out]').forEach(function (a) { a.addEventListener('click', function () { S.track('BookingStarted', { source: 'application-link' }); }); });
    if (S.desktop && S.mountCal(d.getElementById('apply-cal'), prefill, function () { setTimeout(function () { w.location.href = '/booked'; }, 1500); })) {
      S.track('BookingStarted', { source: 'application' });
    }
    if (w.SPARQ_REFRESH) w.SPARQ_REFRESH();
  }
})(window, document);
