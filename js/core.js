/* Core: state (localStorage), helpers, router, global timer. All progress stays in the browser. */
const APP = window.APP = { views: {}, actions: {}, changes: {}, inputs: {}, after: null };
(function () {
  'use strict';
  const KEY = 'aao_prep_v1';
  const defaults = () => ({ v: 1, start: '', exam: '', startTime: '19:00', neg: 0, theme: 'auto', days: {}, log: {}, topics: {}, notes: {}, stats: {}, mocks: [], errors: [], vocab: {}, writings: [], ca: [], checks: {}, newWords: {} });
  const load = () => { try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { return defaults(); } };
  const state = APP.state = load();
  let storageOk = true;
  APP.save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { storageOk = false; } };
  APP.storageOk = () => storageOk;

  /* ---------- helpers ---------- */
  const esc = APP.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const iso = APP.iso = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const today = APP.today = () => iso(new Date());
  const addDays = APP.addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d); };
  const diffDays = APP.diffDays = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
  APP.fmtDate = s => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  APP.fmtMin = m => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? m % 60 + 'm' : ''}`.trim() : `${m}m`;
  APP.toast = msg => { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(APP._tt); APP._tt = setTimeout(() => t.classList.remove('on'), 2400); };
  APP.dayNo = () => state.start ? diffDays(state.start, today()) + 1 : 0;
  APP.dayDate = n => addDays(state.start, n - 1);
  APP.phaseOf = n => PHASES.find(p => n >= p.from && n <= p.to) || PHASES[2];
  APP.clock = (startHHMM, offsetMin) => { const [h, m] = (startHHMM || '19:00').split(':').map(Number); const t = h * 60 + m + offsetMin; return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
  APP.subjTag = s => s === 'ALL' ? '<span class="tag" style="background:#475569">Mixed</span>' : `<span class="tag" style="background:${SUBJ[s].color}">${SUBJ[s].icon} ${SUBJ[s].short}</span>`;

  /* day progress */
  APP.dayState = n => (state.days[n] = state.days[n] || { done: {}, ci: null });
  APP.dayProg = n => {
    const d = PLAN[n - 1], st = state.days[n] || { done: {} };
    const done = d.blocks.filter(b => st.done && st.done[b.id]).reduce((a, b) => a + b.mins, 0);
    const cnt = d.blocks.filter(b => st.done && st.done[b.id]).length;
    return { done, total: d.total, pct: Math.round(done / d.total * 100), cnt, all: cnt === d.blocks.length, any: cnt > 0 || !!(st.ci && st.ci.complete) };
  };
  APP.activity = () => {
    const m = {};
    Object.entries(state.days).forEach(([n, st]) => { const d = PLAN[n - 1]; if (!d) return; Object.entries(st.done || {}).forEach(([id, dt]) => { const b = d.blocks.find(x => x.id === id); if (b && dt) m[dt] = (m[dt] || 0) + b.mins; }); });
    Object.entries(state.log).forEach(([dt, l]) => { m[dt] = (m[dt] || 0) + (l.timer || 0); });
    Object.entries(state.log).forEach(([dt, l]) => { if (l.q && !m[dt]) m[dt] = Math.min(30, l.q); });
    return m;
  };
  APP.streak = () => {
    const a = APP.activity(); let d = today(), s = 0;
    if (!a[d]) d = addDays(d, -1);
    while (a[d]) { s++; d = addDays(d, -1); }
    return s;
  };
  APP.logQ = n => { const t = today(); state.log[t] = state.log[t] || {}; state.log[t].q = (state.log[t].q || 0) + n; };
  APP.recordStat = (topic, correct) => { const s = state.stats[topic] = state.stats[topic] || { c: 0, t: 0 }; s.t++; if (correct) s.c++; };
  APP.subjAcc = subj => { let c = 0, t = 0; TOPICS.filter(x => x.s === subj).forEach(x => { const s = state.stats[x.id]; if (s) { c += s.c; t += s.t; } }); return { c, t, pct: t ? Math.round(c / t * 100) : null }; };
  APP.weakTopics = () => TOPICS.map(t => ({ t, s: state.stats[t.id] })).filter(x => x.s && x.s.t >= 5 && x.s.c / x.s.t < 0.7).sort((a, b) => a.s.c / a.s.t - b.s.c / b.s.t);
  APP.addError = (q, subj) => {
    const ex = state.errors.find(e => e.id === q.id);
    if (ex) { ex.count++; ex.ok = 0; ex.date = today(); return; }
    state.errors.push({ id: q.id, q: q.q, p: q.p, o: q.o, a: q.a, e: q.e, t: q.t, s: q.s || subj, date: today(), count: 1, ok: 0, note: '' });
  };

  /* ---------- charts ---------- */
  APP.lineChart = (pts, opt = {}) => {
    const w = 560, h = 180, p = 30, max = opt.max || Math.max(10, ...pts.map(x => x.y));
    if (!pts.length) return '<p class="mut">No data yet.</p>';
    const X = i => p + (pts.length === 1 ? (w - 2 * p) / 2 : i * (w - 2 * p) / (pts.length - 1)), Y = v => h - p - v / max * (h - 2 * p);
    const grid = [0, .5, 1].map(f => `<line class="gr" x1="${p}" x2="${w - p}" y1="${Y(max * f)}" y2="${Y(max * f)}"/><text x="4" y="${Y(max * f) + 4}">${Math.round(max * f)}</text>`).join('');
    const path = pts.map((x, i) => `${i ? 'L' : 'M'}${X(i)},${Y(x.y)}`).join(' ');
    const dots = pts.map((x, i) => `<circle cx="${X(i)}" cy="${Y(x.y)}" r="3.5"><title>${esc(x.l)}: ${x.y}</title></circle>`).join('');
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(opt.label || 'chart')}">${grid}<path class="ln" d="${path}"/>${dots}</svg>`;
  };
  APP.barChart = (items, opt = {}) => {
    const w = 560, h = 170, p = 26, max = Math.max(opt.max || 0, ...items.map(x => x.y), 1), bw = (w - 2 * p) / items.length;
    const bars = items.map((x, i) => `<rect x="${p + i * bw + 3}" y="${h - p - x.y / max * (h - 2 * p)}" width="${Math.max(2, bw - 6)}" height="${x.y / max * (h - 2 * p)}" rx="3" fill="var(--brand)"><title>${esc(x.l)}: ${x.y}</title></rect><text x="${p + i * bw + bw / 2}" y="${h - 8}" text-anchor="middle">${esc(x.s || '')}</text>`).join('');
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(opt.label || 'chart')}"><line class="gr" x1="${p}" x2="${w - p}" y1="${h - p}" y2="${h - p}"/>${bars}</svg>`;
  };

  /* ---------- theme ---------- */
  APP.applyTheme = () => { const r = document.documentElement; if (state.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', state.theme); };

  /* ---------- pomodoro timer (global so it keeps running while you navigate) ---------- */
  const T = APP.timer = { mode: 'idle', end: 0, total: 0, label: 'Focus', focus: 25, brk: 5, loop: false, sessions: 0 };
  const fmtT = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  APP.timerLeft = () => Math.max(0, Math.round((T.end - Date.now()) / 1000));
  APP.timerStart = (mode) => { T.mode = mode; T.total = (mode === 'focus' ? T.focus : T.brk) * 60; T.end = Date.now() + T.total * 1000; tick(); };
  APP.timerStop = () => { T.mode = 'idle'; tick(); };
  function beep() { try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 660; g.gain.value = .15; o.start(); setTimeout(() => { o.stop(); c.close(); }, 450); } catch (e) { } }
  function tick() {
    const side = document.getElementById('sideTimer'), disp = document.getElementById('timerDisp');
    if (T.mode !== 'idle') {
      const left = APP.timerLeft();
      if (left <= 0) {
        if (T.mode === 'focus') { const t = today(); state.log[t] = state.log[t] || {}; state.log[t].timer = (state.log[t].timer || 0) + T.focus; T.sessions++; APP.save(); APP.toast(`Focus session done (+${T.focus} min). Take a break.`); beep(); APP.timerStart('break'); }
        else { APP.toast('Break over.'); beep(); T.loop ? APP.timerStart('focus') : (T.mode = 'idle'); }
        if (location.hash.startsWith('#/timer')) APP.render();
        return;
      }
      side.hidden = false; side.innerHTML = `<small>${T.mode === 'focus' ? 'Focus' : 'Break'}</small><br><b>${fmtT(left)}</b>`;
      document.title = `${fmtT(left)} · ${T.mode === 'focus' ? 'Focus' : 'Break'} · AAO Prep`;
      if (disp) disp.textContent = fmtT(left);
    } else { side.hidden = true; document.title = 'LIC AAO Prep Studio'; if (disp) disp.textContent = fmtT(T.focus * 60); }
  }
  setInterval(tick, 1000);
  APP.tickNow = tick;

  /* ---------- navigation ---------- */
  const NAV = [
    ['', '🏠', 'Today'], ['plan', '🗓️', 'Study Plan'], ['learn', '📚', 'Learn'], ['practice', '✏️', 'Practice'], ['mock', '⏱️', 'Mock Tests'],
    ['progress', '📈', 'Progress'], ['errors', '📓', 'Error Notebook'], ['vocab', '🔤', 'Vocabulary'], ['write', '✍️', 'Writing Lab'], ['ca', '📰', 'Current Affairs'],
    ['timer', '🍅', 'Focus Timer'], ['formulas', '➗', 'Formula Sheet'], ['guide', '🎯', 'Exam Guide'], ['settings', '⚙️', 'Settings'],
  ];
  const TABS = [['', '🏠', 'Today'], ['plan', '🗓️', 'Plan'], ['learn', '📚', 'Learn'], ['practice', '✏️', 'Practice'], ['mock', '⏱️', 'Mocks'], ['more', '☰', 'More']];
  APP.NAV = NAV;

  APP.parse = () => {
    const h = location.hash.replace(/^#\/?/, ''); const [path, qs] = h.split('?');
    const [route, ...rest] = path.split('/'); const q = {};
    new URLSearchParams(qs || '').forEach((v, k) => q[k] = v);
    return { route: route || '', param: rest.join('/'), q };
  };
  APP.go = p => { location.hash = '#/' + p; };
  APP.render = () => {
    const { route, param, q } = APP.parse(); const main = document.getElementById('main');
    const base = route === 'topic' ? 'learn' : route === 'day' ? 'plan' : route === 'quiz' || route === 'result' ? 'practice' : route;
    const on = base;
    document.getElementById('nav').innerHTML = NAV.map(([r, i, n]) => `<a href="#/${r}" class="${r === on ? 'on' : ''}"><span class="i">${i}</span>${n}</a>`).join('');
    document.getElementById('tabbar').innerHTML = TABS.map(([r, i, n]) => `<a href="#/${r}" class="${(r === on || (r === 'more' && !TABS.some(t => t[0] === on))) ? 'on' : ''}"><span class="i">${i}</span>${n}</a>`).join('');
    const v = APP.views[route] || APP.views.notfound;
    APP.after = null;
    let out;
    try { out = v(param, q); } catch (e) { console.error(e); out = `<div class="card"><h2>Something went wrong</h2><p>${esc(e.message)}</p><a class="btn" href="#/">Back to Today</a></div>`; }
    main.innerHTML = out;
    if (APP.after) APP.after();
    tick();
  };
  window.addEventListener('hashchange', () => { if (!(APP.quizLive && APP.quizLive())) window.scrollTo(0, 0); APP.render(); document.getElementById('main').focus({ preventScroll: true }); });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-a]'); if (!t) return;
    const fn = APP.actions[t.dataset.a]; if (fn) { if (t.tagName === 'A' && !t.getAttribute('href')) e.preventDefault(); fn(t, e); }
  });
  document.addEventListener('change', e => { const t = e.target.closest('[data-c]'); if (t && APP.changes[t.dataset.c]) APP.changes[t.dataset.c](t, e); });
  document.addEventListener('input', e => { const t = e.target.closest('[data-i]'); if (t && APP.inputs[t.dataset.i]) APP.inputs[t.dataset.i](t, e); });
  APP.download = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); };
  APP.badge = (txt, cls) => `<span class="pill ${cls || ''}">${esc(txt)}</span>`;
})();
