(function () {
  'use strict';

  /* ------------------------------------------------------------------
     LAUNCH SWITCH
     Before launch, leave these empty: each format shows "Coming soon".
     At launch, paste the store link for each format that is on sale.
     That format becomes a buy button, the hero label changes to
     "Available now", and a "Buy the book" button appears in the hero.
     ------------------------------------------------------------------ */
  var BUY = {
    paperback: '',
    hardcover: '',
    ebook: ''
  };

  var anyLive = false;
  Object.keys(BUY).forEach(function (name) {
    var url = BUY[name];
    var card = document.querySelector('[data-format="' + name + '"]');
    if (!url || !card) return;
    anyLive = true;
    var a = document.createElement('a');
    a.className = 'btn';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Buy the ' + name;
    var status = card.querySelector('.status');
    status.textContent = '';
    status.appendChild(a);
  });
  if (anyLive) {
    document.querySelectorAll('[data-launch-label]').forEach(function (el) { el.textContent = 'Available now'; });
    document.querySelectorAll('[data-launch-buy]').forEach(function (el) { el.hidden = false; });
    document.querySelectorAll('[data-launch-hide]').forEach(function (el) { el.hidden = true; });
  }

  /* ------------------------------------------------------------------
     ONE PRESS scroll scene
     Scroll position maps 1:1 to --p (0 to 1) on the section; every part
     of the scene is derived from --p in CSS, so it reverses and stops
     exactly with the scroll. Reduced motion keeps the static layout.
     ------------------------------------------------------------------ */
  var press = document.querySelector('.press');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var supported = window.CSS && CSS.supports && CSS.supports('opacity', 'clamp(0, calc(1 * 2), 1)') && CSS.supports('position', 'sticky');
  var ticking = false;

  function measure() {
    ticking = false;
    var r = press.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
    press.style.setProperty('--p', p.toFixed(4));
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
  var form = document.getElementById('sample-form');
  if (form) {
    var err = document.getElementById('sample-err');
    var done = document.getElementById('sample-done');
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
          err.textContent = 'That didn’t go through. Please try again.';
          err.hidden = false;
        });
    });
  }

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
