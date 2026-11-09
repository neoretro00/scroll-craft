/* LAW5 · page behaviour. The engine (scrollcraft.js) drives scroll devices;
   this file holds what is specific to this page: the reading-buddy, the lens
   that follows the clause, the folio, and the sign-up form. */
(function () {
  'use strict';
  ScrollCraft.mount(document.body);

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---- theme links keep your place in the story ------------------------ */
  document.querySelectorAll('[data-theme-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      var cur = document.querySelector('.folio__list a[aria-current="true"]');
      var hash = cur ? cur.getAttribute('href') : '';
      if (hash && hash !== '#top') a.href = a.getAttribute('href').split('#')[0] + hash;
    });
  });

  /* ---- hero planes + buddy eyes follow the pointer --------------------- */
  var scene = document.querySelector('.scene');
  var buddies = Array.prototype.slice.call(document.querySelectorAll('.buddy'));
  var tx = 0, ty = 0, cx = 0, cy = 0, px = 0, py = 0;
  if (finePointer && !reduce) {
    addEventListener('pointermove', function (e) {
      tx = (e.clientX / innerWidth) * 2 - 1;
      ty = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      px += (tx - px) * 0.2; py += (ty - py) * 0.2;
      if (scene) { scene.style.setProperty('--mx', cx.toFixed(4)); scene.style.setProperty('--my', cy.toFixed(4)); }
      buddies.forEach(function (b) { b.style.setProperty('--px', px.toFixed(3)); b.style.setProperty('--py', py.toFixed(3)); });
      requestAnimationFrame(loop);
    })();
  }
  if (!reduce) {
    (function blink() {
      setTimeout(function () {
        buddies.forEach(function (b) { b.classList.add('is-blink'); });
        setTimeout(function () { buddies.forEach(function (b) { b.classList.remove('is-blink'); }); }, 140);
        blink();
      }, 2600 + Math.random() * 2600);
    })();
  }

  /* ---- chapter 2: the reading-buddy walks down the clause --------------- */
  var together = document.querySelector('.together');
  var doc = together && together.querySelector('.doc');
  var lens = doc && doc.querySelector('.doc__lens');
  var segs = doc ? Array.prototype.slice.call(doc.querySelectorAll('.seg')) : [];
  var sum = doc && doc.querySelector('.doc__sum');
  var lastIdx = -2;
  function lensTick() {
    if (lens) {
      var p = parseFloat(together.style.getPropertyValue('--sc-p')) || 0;
      // Publish the clause state for the verification harness (shoot.mjs).
      var st = segs.map(function (s, i) {
        var t = clamp((p - (0.06 + i * 0.19)) / 0.19, 0, 1);
        return Math.round(t * 10);
      }).join('.') + '|' + Math.round(clamp((p - 0.84) / 0.08, 0, 1) * 10);
      if (doc.getAttribute('data-sc-verify-state') !== st) doc.setAttribute('data-sc-verify-state', st);
      var idx = p >= 0.84 ? segs.length : clamp(Math.floor((p - 0.06) / 0.19), 0, segs.length - 1);
      if (idx !== lastIdx) {
        lastIdx = idx;
        var target = idx < segs.length ? segs[idx] : sum;
        var y = target.offsetTop + target.offsetHeight / 2 - lens.offsetHeight / 2;
        lens.style.setProperty('--lens-y', Math.max(0, y) + 'px');
        segs.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      }
    }
    requestAnimationFrame(lensTick);
  }
  if (lens) {
    requestAnimationFrame(lensTick);
    addEventListener('resize', function () { lastIdx = -2; });
    document.fonts && document.fonts.ready.then(function () { lastIdx = -2; });
  }

  /* ---- folio: where you are, and a way to jump ------------------------- */
  var folioBtn = document.querySelector('.folio__btn');
  var folioList = document.getElementById('folio-list');
  var folioNow = document.querySelector('[data-folio-now]');
  function setFolio(open) {
    folioBtn.setAttribute('aria-expanded', String(open));
    folioList.hidden = !open;
  }
  folioBtn.addEventListener('click', function () { setFolio(folioList.hidden); });
  folioList.addEventListener('click', function (e) { if (e.target.closest('a')) setFolio(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !folioList.hidden) { setFolio(false); folioBtn.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (!folioList.hidden && !e.target.closest('.folio')) setFolio(false);
  });

  var chapters = Array.prototype.slice.call(document.querySelectorAll('[data-chapter]'));
  function updateFolio() {
    var mid = innerHeight * 0.45, current = chapters[0];
    chapters.forEach(function (c) { if (c.getBoundingClientRect().top <= mid) current = c; });
    var label = current.getAttribute('data-chapter');
    if (folioNow.textContent !== label) {
      folioNow.textContent = label;
      folioList.querySelectorAll('a').forEach(function (a) {
        a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + current.id));
      });
    }
  }
  addEventListener('scroll', updateFolio, { passive: true });
  updateFolio();

  /* ---- sign-up. Honest about where the entry goes. --------------------- */
  var form = document.querySelector('.signup');
  if (form) {
    var msg = form.querySelector('.signup__msg');
    var email = form.querySelector('#email');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'signup__msg';
      var value = email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        email.setAttribute('aria-invalid', 'true');
        msg.classList.add('is-err');
        msg.textContent = 'That email doesn\'t look right. Check it and try again.';
        email.focus();
        return;
      }
      email.removeAttribute('aria-invalid');
      var entry = { email: value, ask: form.querySelector('#ask').value.trim(), at: new Date().toISOString() };
      var endpoint = form.getAttribute('data-endpoint');
      var btn = form.querySelector('button');

      if (endpoint) {
        btn.disabled = true;
        msg.textContent = 'Sending…';
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })
          .then(function (r) {
            if (!r.ok) throw new Error(r.status);
            msg.classList.add('is-ok');
            msg.textContent = 'You\'re on the list. We\'ll email ' + value + ' when your spot opens.';
            form.reset();
          })
          .catch(function () {
            msg.classList.add('is-err');
            msg.textContent = 'We couldn\'t send that just now. Please try again in a moment.';
          })
          .then(function () { btn.disabled = false; });
        return;
      }

      // No sign-up service configured in this build: say so, keep it local.
      try {
        var list = JSON.parse(localStorage.getItem('law5-beta') || '[]');
        list.push(entry);
        localStorage.setItem('law5-beta', JSON.stringify(list));
      } catch (err) { /* storage unavailable; the message below still holds */ }
      msg.classList.add('is-ok');
      msg.textContent = 'Thanks! This preview isn\'t connected to a sign-up service yet, so your entry is saved in this browser only.';
      form.reset();
    });
    email.addEventListener('input', function () { email.removeAttribute('aria-invalid'); });
  }
})();
