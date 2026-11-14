(function () {
  'use strict';

  /* ------------------------------------------------------------------
     LAUNCH SWITCH
     Before launch, leave these empty: the buy section stays hidden.
     At launch, paste the store link for each format that is on sale.
     Each one becomes a buy button in a section above the footer, the hero label changes to
     "Available now", and a "Buy the book" button appears in the hero.
     ------------------------------------------------------------------ */
  var BUY = {
    paperback: '',
    hardcover: '',
    ebook: ''
  };

  var row = document.getElementById('buy-row');
  var anyLive = false;
  Object.keys(BUY).forEach(function (name) {
    var url = BUY[name];
    if (!url || !row) return;
    anyLive = true;
    var a = document.createElement('a');
    a.className = 'btn';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Buy the ' + name;
    row.appendChild(a);
  });
  if (anyLive) {
    var wrap = document.getElementById('buy-wrap');
    if (wrap) wrap.hidden = false;
    document.querySelectorAll('[data-launch-label]').forEach(function (el) { el.textContent = 'Available now'; });
    document.querySelectorAll('[data-launch-buy]').forEach(function (el) { el.hidden = false; });
  }

  /* ------------------------------------------------------------------
     COVER scroll scene
     Scroll position maps 1:1 to --p (0 to 1) on the section; every part
     of the scene is derived from --p in CSS, so it reverses and stops
     exactly with the scroll. Reduced motion keeps the static layout.
     ------------------------------------------------------------------ */
  var press = document.querySelector('.story');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var supported = window.CSS && CSS.supports && CSS.supports('opacity', 'clamp(0, calc(1 * 2), 1)') && CSS.supports('position', 'sticky');
  var ticking = false;
  var bar = document.querySelector('.bar');

  function measure() {
    ticking = false;
    var r = press.getBoundingClientRect();
    // The cover is pinned just below the header. The animation runs over the pinned
    // distance, capped at about two screens so it never feels slow on long pages.
    var barH = bar ? bar.offsetHeight : 0;
    var span = Math.min((r.height - (window.innerHeight - barH)) * 0.85, window.innerHeight * 2);
    var p = span > 0 ? Math.min(1, Math.max(0, (barH - r.top) / span)) : 1;
    var st = press.style;
    st.setProperty('--p', p.toFixed(4));
    // Three out-of-phase waves keep the keys moving as you scroll; --sh sweeps the sheen.
    var t = p * Math.PI * 2 * 3.5;
    st.setProperty('--wa', (0.5 + 0.5 * Math.sin(t)).toFixed(3));
    st.setProperty('--wb', (0.5 + 0.5 * Math.sin(t + 2.094)).toFixed(3));
    st.setProperty('--wc', (0.5 + 0.5 * Math.sin(t + 4.189)).toFixed(3));
    st.setProperty('--sh', ((p * 5) % 1).toFixed(3));
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(measure);
  }
  function setLive() {
    var live = supported && !reduce.matches;
    press.classList.toggle('is-live', live);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (live) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      measure();
    } else {
      press.style.setProperty('--p', '1');
    }
  }
  if (press) {
    setLive();
    if (reduce.addEventListener) reduce.addEventListener('change', setLive);
  }

  /* ------------------------------------------------------------------
     Sample signup (Kit). Posts straight to the form endpoint, same
     approach as the home page. No ck.js script on purpose.
     ------------------------------------------------------------------ */
  function wire(form) {
    var err = form.querySelector('.err');
    var done = form.parentNode.querySelector('.form-done');
    var btn = form.querySelector('button');
    var label = btn.textContent;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var id = form.getAttribute('data-kit-form');
      if (!id) { err.textContent = 'Signups open shortly. Please check back soon.'; err.hidden = false; return; }
      btn.disabled = true;
      btn.textContent = 'Sending';
      fetch('https://app.kit.com/forms/' + id + '/subscriptions', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(String(r.status)); })
        .then(function () {
          form.hidden = true;
          done.hidden = false;
          done.focus();
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = label;
          err.textContent = 'That didn\u2019t go through. Please try again.';
          err.hidden = false;
        });
    });
  }
  ['sample-form'].forEach(function (id) {
    var f = document.getElementById(id);
    if (f) wire(f);
  });

  /* Copy link */
  var copy = document.getElementById('copy-link');
  if (copy) {
    copy.addEventListener('click', function () {
      var url = 'https://haroldmann.com/push-button-management/';
      var ok = function () { copy.textContent = 'Link copied'; setTimeout(function () { copy.textContent = 'Copy the link'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, function () { window.prompt('Copy this link', url); });
      else window.prompt('Copy this link', url);
    });
  }
})();
