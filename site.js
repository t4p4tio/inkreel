/* Fills in the newest version from latest.json (written by release.py) and lists changelog.json.
   The page works without it: the Download button always points at the newest release. */
(() => {
  const $ = s => document.querySelector(s);
  const fill = (name, text) => { const el = $(`[data-fill="${name}"]`); if (el) { el.textContent = text; el.hidden = false; } };
  const mb = bytes => `${(bytes / 1e6).toFixed(1)} MB`;
  const day = iso => {
    const d = new Date(`${iso}T12:00:00`);
    return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const get = url => fetch(url, { cache: 'no-cache' }).then(r => (r.ok ? r.json() : Promise.reject(r.status)));

  get('latest.json').then(m => {
    fill('version', `Version ${m.version}`);
    fill('size', mb(m.size));
    fill('sha', m.sha256);
    fill('version-foot', `Inkreel ${m.version} · ${day(m.date)}`);
  }).catch(() => {});

  get('changelog.json').then(list => {
    if (!Array.isArray(list) || !list.length) return;
    const box = $('[data-log]');
    box.textContent = '';
    list.forEach((r, i) => {
      const row = document.createElement('article');
      row.className = 'rel' + (i === 0 ? ' latest' : '');
      const h = document.createElement('h3');
      h.textContent = r.version;
      const small = document.createElement('small');
      for (const t of [day(r.date), r.size ? mb(r.size) : ''].filter(Boolean)) {
        const sp = document.createElement('span'); sp.textContent = t; small.append(sp);
      }
      h.append(small);
      const body = document.createElement('div');
      const lines = String(r.notes || '').split('\n').map(s => s.trim()).filter(Boolean);
      const items = lines.filter(s => /^[-*•]\s+/.test(s));
      if (items.length && items.length === lines.length) {
        const ul = document.createElement('ul');
        for (const s of items) { const li = document.createElement('li'); li.textContent = s.replace(/^[-*•]\s+/, ''); ul.append(li); }
        body.append(ul);
      } else {
        for (const s of lines) { const p = document.createElement('p'); p.textContent = s; body.append(p); }
      }
      row.append(h, body);
      box.append(row);
    });
  }).catch(() => {});
})();
