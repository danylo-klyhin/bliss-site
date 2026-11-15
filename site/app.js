/* Bliss: shared logic for every variant. Language, opening status, and the carta renderer. */
(function () {
  'use strict';

  /* Where "Reservar mesa" goes. Empty means the button is shown but does nothing.
     Examples: 'tel:+34600000000', 'https://wa.me/34600000000', or a booking page address. */
  var RESERVE_LINK = '';
  var MAPS = 'https://www.google.com/maps/place/Bliss+-+Vinos+Naturales+y+C%C3%B3cteles/@39.4612,-0.3726838,17z/data=!4m6!3m5!1s0xd6049bfff740477:0xed39a8cbf5d002dc!8m2!3d39.4612!4d-0.3726838!16s%2Fg%2F11r9v8l1h2';
  var INSTAGRAM = 'https://www.instagram.com/bliss.ruzafa/';

  /* Directions. Both are ordinary https links: each opens its app when installed, the web map otherwise. */
  var DIRECTIONS = {
    google: 'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent('Bliss - Vinos Naturales y Cócteles, C/ de la Reina Na Maria, 1, 46006 València'),
    apple: 'https://maps.apple.com/?daddr=' + encodeURIComponent('Carrer de la Reina Na Maria, 1, 46006 València')
  };
  function isIOS() {
    var ua = navigator.userAgent;
    return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  }

  /* Opening hours in Madrid time. Day 0 is Sunday. close > 24 means after midnight. */
  var HOURS = { 2: [18, 24], 3: [18, 24], 4: [18, 24], 5: [18, 26], 6: [18, 26] };

  var T = {
    es: {
      tagline: 'Vinos naturales y cócteles',
      about: 'Bar de vinos en Ruzafa. Vino natural por copa y por botella, cócteles de autor y picoteo.',
      see_menu: 'Ver la carta',
      reserve: 'Reservar mesa',
      menu: 'Carta',
      home: 'Inicio',
      visit: 'Dónde estamos',
      address_1: 'Carrer de la Reina Na Maria, 1',
      address_2: 'Ruzafa, 46006 València',
      directions: 'Cómo llegar',
      hours: 'Horario',
      hours_1: 'Martes a jueves, de 18:00 a 24:00',
      hours_2: 'Viernes y sábado, de 18:00 a 2:00',
      hours_3: 'Domingo y lunes, cerrado',
      instagram: 'Instagram',
      open_now: 'Abierto hasta las {h}',
      opens_today: 'Abrimos hoy a las 18:00',
      opens_next: 'Cerrado. Abrimos el {d} a las 18:00',
      h_days_1: 'Martes a jueves', h_time_1: '18:00 a 24:00',
      h_days_2: 'Viernes y sábado', h_time_2: '18:00 a 2:00',
      h_days_3: 'Domingo y lunes', h_time_3: 'Cerrado',
      addr: 'C/ Reina Na Maria, 1', go: 'Cómo llegar', open_in: 'Abrir en', cancel: 'Cancelar',
      days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      lang_switch: 'EN',
      lang_label: 'Switch to English',
      groups_label: 'Secciones de la carta',
      filter_label: 'Filtrar por tipo',
      all: 'Todos',
      type_blanco: 'Blanco', type_tinto: 'Tinto', type_orange: 'Orange', type_rosado: 'Rosado', type_petnat: 'Pet nat',
      funk: 'Funk', funk_of: '{n} de 4',
      funk_note: 'Funk: de 1, limpio y fácil, a 4, salvaje.',
      acid: 'Acidez', acid_of: '{n} de 5',
      body: 'Cuerpo', body_ligero: 'Ligero', body_medio: 'Medio', body_cuerpo: 'Con cuerpo',
      pair: 'Va bien con',
      empty: 'Ahora mismo no tenemos ninguno de este tipo.',
      photo: 'Foto',
      type_otros: 'Otros naturales', type_otros_short: 'Otros',
      subs_label: 'Dentro de esta sección'
    },
    en: {
      tagline: 'Natural wines and cocktails',
      about: 'A wine bar in Ruzafa. Natural wine by the glass and by the bottle, house cocktails and snacks.',
      see_menu: 'See the menu',
      reserve: 'Book a table',
      menu: 'Menu',
      home: 'Home',
      visit: 'Find us',
      address_1: 'Carrer de la Reina Na Maria, 1',
      address_2: 'Ruzafa, 46006 València',
      directions: 'Get directions',
      hours: 'Opening hours',
      hours_1: 'Tuesday to Thursday, 18:00 to 24:00',
      hours_2: 'Friday and Saturday, 18:00 to 2:00',
      hours_3: 'Sunday and Monday, closed',
      instagram: 'Instagram',
      open_now: 'Open until {h}',
      opens_today: 'We open today at 18:00',
      opens_next: 'Closed. We open {d} at 18:00',
      h_days_1: 'Tuesday to Thursday', h_time_1: '18:00 to 24:00',
      h_days_2: 'Friday and Saturday', h_time_2: '18:00 to 2:00',
      h_days_3: 'Sunday and Monday', h_time_3: 'Closed',
      addr: 'C/ Reina Na Maria, 1', go: 'Directions', open_in: 'Open in', cancel: 'Cancel',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      lang_switch: 'ES',
      lang_label: 'Cambiar a español',
      groups_label: 'Menu sections',
      filter_label: 'Filter by type',
      all: 'All',
      type_blanco: 'White', type_tinto: 'Red', type_orange: 'Orange', type_rosado: 'Rosé', type_petnat: 'Pet nat',
      funk: 'Funk', funk_of: '{n} of 4',
      funk_note: 'Funk: from 1, clean and easy, to 4, wild.',
      acid: 'Acidity', acid_of: '{n} of 5',
      body: 'Body', body_ligero: 'Light', body_medio: 'Medium', body_cuerpo: 'Full',
      pair: 'Goes well with',
      empty: 'We have none of this type right now.',
      photo: 'Photo',
      type_otros: 'Other natural wines', type_otros_short: 'Others',
      subs_label: 'In this section'
    }
  };

  var lang = 'es';
  try {
    lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('bliss-lang') || 'es';
  } catch (e) { /* storage can be blocked; Spanish is the default */ }
  if (!T[lang]) lang = 'es';

  function t(key, vars) {
    var s = T[lang][key] != null ? T[lang][key] : T.es[key];
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function loc(obj, key) { return (lang === 'en' && obj[key + '_en']) || obj[key] || ''; }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function price(cents) {
    var v = cents / 100;
    return (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',')) + ' €';
  }

  /* ---------- Opening status ---------- */
  function madridNow() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    var get = function (type) { return parts.filter(function (p) { return p.type === type; })[0].value; };
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day: day, hour: (parseInt(get('hour'), 10) % 24) + parseInt(get('minute'), 10) / 60 };
  }

  function status() {
    var now = madridNow();
    var fmt = function (h) { return (h % 24 === 0 ? 24 : h % 24) + ':00'; };
    var today = HOURS[now.day];
    var yesterday = HOURS[(now.day + 6) % 7];
    if (yesterday && yesterday[1] > 24 && now.hour < yesterday[1] - 24) {
      return { open: true, text: t('open_now', { h: fmt(yesterday[1]) }) };
    }
    if (today && now.hour >= today[0]) return { open: true, text: t('open_now', { h: fmt(today[1]) }) };
    if (today) return { open: false, text: t('opens_today') };
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (HOURS[d]) return { open: false, text: t('opens_next', { d: T[lang].days[d] }) };
    }
    return { open: false, text: '' };
  }

  /* ---------- Static text ---------- */
  function applyStatic() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (n) { n.textContent = t(n.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-href]').forEach(function (n) {
      n.href = { booking: RESERVE_LINK || '#', maps: MAPS, instagram: INSTAGRAM }[n.getAttribute('data-href')];
    });
    document.querySelectorAll('[data-reserve]').forEach(function (n) {
      if (RESERVE_LINK) n.setAttribute('href', RESERVE_LINK); else n.removeAttribute('href');
    });
    document.querySelectorAll('[data-directions]').forEach(function (n) { n.href = DIRECTIONS.google; });
    document.querySelectorAll('[data-map]').forEach(function (n) { n.href = DIRECTIONS[n.getAttribute('data-map')]; });
    document.querySelectorAll('[data-status]').forEach(function (n) {
      var s = status();
      n.classList.toggle('is-open', s.open);
      n.querySelector('.status-text').textContent = s.text;
    });
    document.querySelectorAll('[data-lang]').forEach(function (n) {
      n.textContent = t('lang_switch');
      n.setAttribute('aria-label', t('lang_label'));
    });
  }

  /* ---------- Carta ---------- */
  var wineFilter = 'all';

  function scale(n, max) {
    var wrap = el('span', 'scale');
    wrap.setAttribute('aria-hidden', 'true');
    for (var i = 1; i <= max; i++) wrap.appendChild(el('i', i <= n ? 'on' : ''));
    return wrap;
  }

  function fact(dl, label, valueNode, valueText) {
    dl.appendChild(el('dt', null, label));
    var dd = el('dd');
    if (valueNode) dd.appendChild(valueNode);
    dd.appendChild(el('span', valueNode ? 'sr-only' : null, valueText));
    dl.appendChild(dd);
  }

  function row(it, meta, keepMeta) {
    var r = el('span', 'item-row');
    var name = el('span', 'item-name', loc(it, 'name'));
    r.appendChild(name);
    r.appendChild(el('span', 'item-lead'));
    r.appendChild(el('span', 'item-price', price(it.price)));
    var frag = document.createDocumentFragment();
    frag.appendChild(r);
    if (meta || keepMeta) frag.appendChild(el('span', 'item-meta', meta || ''));
    return frag;
  }

  function wineItem(it) {
    var li = el('li', 'item wine');
    li.dataset.type = it.type || '';
    var meta = it.type ? t('type_' + it.type) : '';
    var hasFacts = it.funk || it.acid || it.body || it.pair;
    if (!it.img && !hasFacts) {
      li.appendChild(row(it, meta));
      return li;
    }
    var details = el('details');
    var summary = el('summary');
    summary.appendChild(row(it, meta, true));
    details.appendChild(summary);
    var detail = el('div', 'wine-detail');
    if (it.img) {
      var img = el('img');
      img.src = it.img; img.alt = ''; img.loading = 'lazy'; img.width = 88; img.height = 118;
      detail.appendChild(img);
    }
    if (hasFacts) {
      var dl = el('dl', 'wine-facts');
      if (it.funk) fact(dl, t('funk'), scale(it.funk, 4), t('funk_of', { n: it.funk }));
      if (it.acid) fact(dl, t('acid'), scale(it.acid, 5), t('acid_of', { n: it.acid }));
      if (it.body) fact(dl, t('body'), null, t('body_' + it.body));
      if (it.pair) fact(dl, t('pair'), null, loc(it, 'pair'));
      detail.appendChild(dl);
    }
    details.appendChild(detail);
    li.appendChild(details);
    return li;
  }

  function plainItem(it) {
    var li = el('li', 'item');
    li.appendChild(row(it));
    var desc = loc(it, 'desc');
    if (desc) li.appendChild(el('p', 'item-desc', desc));
    return li;
  }

  function filters(sub, list, empty) {
    var types = ['blanco', 'orange', 'tinto', 'rosado', 'petnat'].filter(function (ty) {
      return sub.items.some(function (it) { return it.type === ty; });
    });
    var wrap = el('div', 'filters');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', t('filter_label'));
    ['all'].concat(types).forEach(function (ty) {
      var b = el('button', 'chip', ty === 'all' ? t('all') : t('type_' + ty));
      b.type = 'button';
      b.setAttribute('aria-pressed', String(wineFilter === ty));
      b.addEventListener('click', function () {
        wineFilter = ty;
        wrap.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        apply();
      });
      wrap.appendChild(b);
    });
    function apply() {
      var shown = 0;
      list.querySelectorAll('.item').forEach(function (li) {
        var hide = wineFilter !== 'all' && li.dataset.type !== wineFilter;
        li.hidden = hide;
        if (!hide) shown++;
      });
      empty.hidden = shown > 0;
    }
    apply();
    return wrap;
  }

  /* Grouped mode: the bottle list is split by colour into ordinary subsections. No filter. */
  function splitByColour(sub) {
    var out = [];
    ['blanco', 'orange', 'tinto', 'rosado', 'petnat', ''].forEach(function (ty) {
      var items = sub.items.filter(function (it) { return (it.type || '') === ty; });
      if (!items.length) return;
      out.push({
        id: 'vino-' + (ty || 'otros'),
        title: t(ty ? 'type_' + ty : 'type_otros'),
        short: t(ty ? 'type_' + ty : 'type_otros_short'),
        kicker: out.length ? '' : loc(sub, 'name'),
        items: items
      });
    });
    return out;
  }

  function renderCarta() {
    var main = document.getElementById('carta');
    var nav = document.getElementById('groups');
    var subnav = document.getElementById('subnav');
    if (!main || !window.BLISS_MENU) return;
    var grouped = document.body.dataset.wine === 'grouped';
    var navData = {};
    main.textContent = '';
    nav.textContent = '';
    nav.setAttribute('aria-label', t('groups_label'));
    if (subnav) subnav.setAttribute('aria-label', t('subs_label'));

    window.BLISS_MENU.groups.forEach(function (g) {
      var link = el('a', null, loc(g, 'short'));
      link.href = '#' + g.id;
      nav.appendChild(link);

      var section = el('section', 'group');
      section.id = g.id;
      section.appendChild(el('h2', 'group-title', loc(g, 'name')));

      var subs = [];
      g.subs.forEach(function (sub) {
        if (sub.wine && grouped) { subs = subs.concat(splitByColour(sub)); return; }
        subs.push({ id: sub.id, title: loc(sub, 'name'), short: loc(sub, 'short') || loc(sub, 'name'), items: sub.items, wine: sub.wine, src: sub });
      });
      navData[g.id] = subs.filter(function (x) { return x.title; });

      subs.forEach(function (sub) {
        var s = el('section', 'sub');
        s.id = sub.id;
        if (sub.kicker) s.appendChild(el('p', 'sub-kicker', sub.kicker));
        if (sub.title) s.appendChild(el('h3', 'sub-title', sub.title));
        var list = el('ul', 'items');
        sub.items.forEach(function (it) { list.appendChild(sub.wine ? wineItem(it) : plainItem(it)); });
        if (sub.wine) {
          var empty = el('p', 'empty', t('empty'));
          s.appendChild(filters(sub.src, list, empty));
          s.appendChild(el('p', 'note', t('funk_note')));
          s.appendChild(list);
          s.appendChild(empty);
        } else {
          s.appendChild(list);
        }
        section.appendChild(s);
      });
      main.appendChild(section);
    });
    spy(nav, subnav, navData);
  }

  /* Keeps both navigation rows in step with the scroll position.
     The current subsection is the last one whose top has passed a line just under the sticky rows.
     The two page ends are pinned: first subsection at the top, last one once the page cannot scroll further. */
  var spyHandler;
  function spy(nav, subnav, navData) {
    var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
    var subs = Array.prototype.slice.call(document.querySelectorAll('.sub'));
    var shownGroup = null, shownSub = null, ticking = false;

    function mark(row, id) {
      row.querySelectorAll('a').forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        if (on && row.scrollWidth > row.clientWidth) row.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' });
      });
    }
    function showGroup(id) {
      if (shownGroup === id) return;
      shownGroup = id;
      shownSub = null;
      mark(nav, id);
      if (!subnav) return;
      subnav.textContent = '';
      var list = navData[id] || [];
      if (list.length > 1) list.forEach(function (x) {
        var a = el('a', null, x.short);
        a.href = '#' + x.id;
        subnav.appendChild(a);
      });
      subnav.scrollLeft = 0;
    }
    function update() {
      ticking = false;
      if (!subs.length) return;
      var current = subs[0];
      for (var i = 1; i < subs.length; i++) {
        if (subs[i].getBoundingClientRect().top <= 132) current = subs[i]; else break;
      }
      var doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2 && window.scrollY > 0) current = subs[subs.length - 1];
      showGroup(current.closest('.group').id);
      if (subnav && shownSub !== current.id) {
        shownSub = current.id;
        mark(subnav, current.id);
      }
    }

    if (spyHandler) {
      window.removeEventListener('scroll', spyHandler);
      window.removeEventListener('resize', spyHandler);
    }
    spyHandler = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener('scroll', spyHandler, { passive: true });
    window.addEventListener('resize', spyHandler);
    update();
  }

  function render() {
    applyStatic();
    renderCarta();
  }

  /* On iPhone the directions row opens a two-option sheet. Everywhere else, and if the sheet
     cannot open, the row stays a plain link to Google Maps. */
  document.addEventListener('click', function (e) {
    var sheet = document.getElementById('maps-sheet');
    if (!sheet) return;
    if (e.target === sheet || e.target.closest('[data-map]')) { sheet.close(); return; }
    if (!e.target.closest('[data-directions]') || !isIOS() || !sheet.showModal) return;
    try { sheet.showModal(); } catch (err) { return; }
    sheet.focus(); /* keep the focus ring off the first option when opened by touch */
    e.preventDefault();
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-lang]');
    if (!btn) return;
    lang = lang === 'es' ? 'en' : 'es';
    try { localStorage.setItem('bliss-lang', lang); } catch (err) { /* not saved; still switches for this visit */ }
    render();
  });

  render();
})();
