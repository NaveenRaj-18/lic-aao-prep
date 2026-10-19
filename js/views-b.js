/* Views: Practice, Quiz engine, Results, Mocks, Progress, Errors */
(function () {
  const A = APP, S = A.state, V = A.views, esc = A.esc;
  const L = ['A', 'B', 'C', 'D', 'E', 'F'];
  const reload = () => { const y = window.scrollY; A.render(); window.scrollTo(0, y); };
  let Q = null, qInt = null;
  A.quizLive = () => !!(Q && !Q.finished && location.hash.startsWith('#/quiz'));
  const mm = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const pShow = p => !p ? '' : p.startsWith('<table') ? p : `<div class="passage">${esc(p)}</div>`;
  const EN_TOPICS = () => topicsOf('EN').filter(t => !['e_let', 'e_ess'].includes(t));
  const sec = (name, subj, ids, n, mins) => ({ name, subj, qs: getQuestions(ids, n, { preferGen: true }), mins });

  /* ---------- engine ---------- */
  function startQuiz(cfg) {
    const qs = []; cfg.sections.forEach(s => { s.from = qs.length; qs.push(...s.qs); s.to = qs.length; });
    if (!qs.length) { A.toast('No questions available for this selection.'); return; }
    const n = qs.length;
    Q = Object.assign({ qs, ans: Array(n).fill(null), mark: Array(n).fill(false), time: Array(n).fill(0), rec: Array(n).fill(false), sec: 0, cur: cfg.sections[0].from, startedAt: Date.now(), qStart: Date.now(), finished: false }, cfg);
    Q.secEnd = cfg.timed ? Date.now() + cfg.sections[0].mins * 60000 : 0;
    clearInterval(qInt); qInt = setInterval(qTick, 1000);
    A.go('quiz'); A.render();
  }
  function qTick() {
    if (!Q || Q.finished) { clearInterval(qInt); return; }
    const el = document.getElementById('qtimer'); if (!el || !location.hash.startsWith('#/quiz')) return;
    if (Q.timed) { const left = Math.max(0, Math.round((Q.secEnd - Date.now()) / 1000)); el.textContent = mm(left); el.classList.toggle('low', left < 120); if (left <= 0) { A.toast('Time up for this section.'); submitSection(true); } }
    else el.textContent = mm((Date.now() - Q.startedAt) / 1000);
  }
  const touch = () => { const now = Date.now(); Q.time[Q.cur] += (now - Q.qStart) / 1000; Q.qStart = now; };
  function record(i) {
    if (Q.rec[i] || Q.ans[i] === null) return; Q.rec[i] = true;
    const q = Q.qs[i], ok = Q.ans[i] === q.a; A.recordStat(q.t, ok); A.logQ(1);
    if (!ok) A.addError(q, q.s);
    else if (Q.type === 'errors') { const e = S.errors.find(x => x.id === q.id); if (e) { e.ok = (e.ok || 0) + 1; if (e.ok >= 2) S.errors = S.errors.filter(x => x !== e); } }
  }
  function submitSection(auto) {
    if (!Q || Q.finished) return; touch();
    const s = Q.sections[Q.sec];
    if (!auto) { const un = Q.ans.slice(s.from, s.to).filter(a => a === null).length; if (!confirm(`Submit ${Q.sec === Q.sections.length - 1 ? 'the test' : 'this section'}?${un ? ` ${un} question(s) are unanswered.` : ''}${Q.sec < Q.sections.length - 1 ? ' You cannot return to this section.' : ''}`)) return; }
    if (Q.sec < Q.sections.length - 1) { Q.sec++; Q.cur = Q.sections[Q.sec].from; Q.qStart = Date.now(); if (Q.timed) Q.secEnd = Date.now() + Q.sections[Q.sec].mins * 60000; A.render(); window.scrollTo(0, 0); }
    else finish();
  }
  function finish() {
    touch(); Q.finished = true; clearInterval(qInt);
    const neg = Q.timed ? +S.neg : 0; const secs = [], topics = {};
    Q.sections.forEach(s => {
      let c = 0, w = 0, k = 0, t = 0;
      for (let i = s.from; i < s.to; i++) { const a = Q.ans[i], q = Q.qs[i], ok = a === q.a; t += Q.time[i]; if (a === null) k++; else if (ok) c++; else w++; record(i); const tp = topics[q.t] = topics[q.t] || { c: 0, t: 0 }; if (a !== null) { tp.t++; if (ok) tp.c++; } }
      secs.push({ name: s.name, total: s.to - s.from, correct: c, wrong: w, skip: k, score: +(c - w * neg).toFixed(2), time: Math.round(t) });
    });
    const score = +secs.reduce((a, s) => a + s.score, 0).toFixed(2), max = Q.qs.length;
    Q.result = { id: Date.now(), date: A.today(), name: Q.name, type: Q.type, score, max, neg, secs, timeSec: Math.round((Date.now() - Q.startedAt) / 1000), topics };
    if (Q.kind === 'exam') S.mocks.push({ id: Q.result.id, date: Q.result.date, name: Q.name, type: Q.type, score, max, neg, secs, timeSec: Q.result.timeSec });
    A.save(); A.go('result');
  }

  /* ---------- Practice setup ---------- */
  V.practice = (p, q) => {
    const selVal = q.topic ? 'T:' + q.topic : q.subj ? 'S:' + q.subj : 'S:QA';
    const nSel = +q.n || 10;
    const opts = Object.keys(SUBJ).map(k => `<optgroup label="${esc(SUBJ[k].name)}"><option value="S:${k}" ${selVal === 'S:' + k ? 'selected' : ''}>All ${esc(SUBJ[k].short)} topics (mixed)</option>${TOPICS.filter(t => t.s === k).map(t => `<option value="T:${t.id}" ${selVal === 'T:' + t.id ? 'selected' : ''}>${esc(t.n)}</option>`).join('')}</optgroup>`).join('');
    const weak = A.weakTopics().slice(0, 4);
    return `<h1>Practice</h1>
    <div class="card"><div class="field"><label for="pr-sel">What do you want to practise?</label><select id="pr-sel">${opts}</select></div>
    <div class="field"><label for="pr-n">Number of questions</label><select id="pr-n">${[5, 10, 15, 20, 25, 35].map(n => `<option ${n === nSel ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="field"><label for="pr-m">Mode</label><select id="pr-m"><option value="learn">Learning mode: instant feedback after each question</option><option value="timed">Timed mode: exam-style, review at the end</option></select></div>
    <button class="btn p" data-a="startPractice">Start practice</button>
    <p class="notice">Quant, reasoning series/inequality/coding, direction, ranking, seating and vocabulary questions are generated fresh every time. English, GK and Insurance use a fixed starter bank. Add official previous-year papers for full coverage.</p></div>
    ${weak.length ? `<div class="card"><h3>Your weak topics</h3><div class="chips">${weak.map(w => `<a class="chip" href="#/practice?topic=${w.t.id}&n=15">${esc(w.t.n)} · ${Math.round(w.s.c / w.s.t * 100)}%</a>`).join('')}</div></div>` : ''}`;
  };
  A.actions.startPractice = () => {
    const [kind, id] = document.getElementById('pr-sel').value.split(':'), n = +document.getElementById('pr-n').value, timed = document.getElementById('pr-m').value === 'timed';
    const ids = kind === 'T' ? [id] : topicsOf(id); const name = kind === 'T' ? TOPIC_BY_ID[id].n : SUBJ[id].name;
    const qs = getQuestions(ids, n, { preferGen: true });
    startQuiz({ kind: 'practice', type: 'practice', name: 'Practice: ' + name, sections: [{ name, qs, mins: Math.round(n * 1.2) }], timed: false, instant: !timed });
  };

  /* ---------- Quiz view ---------- */
  V.quiz = () => {
    if (!Q || Q.finished) { setTimeout(() => A.go(Q && Q.finished ? 'result' : 'practice'), 0); return '<p>Loading…</p>'; }
    const s = Q.sections[Q.sec], i = Q.cur, q = Q.qs[i], sel = Q.ans[i], revealed = Q.instant && sel !== null;
    const pal = []; for (let k = s.from; k < s.to; k++) pal.push(`<button class="${Q.ans[k] !== null ? 'ans' : ''} ${Q.mark[k] ? 'mark' : ''} ${k === i ? 'cur' : ''}" data-a="qgo" data-i="${k}" aria-label="Question ${k - s.from + 1}">${k - s.from + 1}</button>`);
    const opts = q.o.map((o, k) => {
      let cls = 'opt'; if (revealed) { if (k === q.a) cls += ' right'; else if (k === sel) cls += ' wrong'; } else if (k === sel) cls += ' sel';
      return `<button class="${cls}" data-a="qpick" data-k="${k}" ${revealed ? 'disabled' : ''}><b>${L[k]}</b><span>${esc(o)}</span></button>`;
    }).join('');
    const isLastInSec = i === s.to - 1;
    return `<div class="row between"><div><small>${esc(Q.name)}</small><h2 style="margin:0">${Q.sections.length > 1 ? esc(s.name) + ' · ' : ''}Question ${i - s.from + 1} of ${s.to - s.from}</h2></div>
      <div style="text-align:right"><small>${Q.timed ? 'Section time left' : 'Elapsed'}</small><div class="timer" id="qtimer">${Q.timed ? mm(Math.max(0, (Q.secEnd - Date.now()) / 1000)) : mm((Date.now() - Q.startedAt) / 1000)}</div></div></div>
    <div class="grid" style="grid-template-columns:minmax(0,1fr);margin-top:12px"><div class="card">
      <div class="row between"><span class="pill">${esc((TOPIC_BY_ID[q.t] || {}).n || '')}</span>${Q.timed ? `<button class="btn sm" data-a="qmark">${Q.mark[i] ? '★ Marked' : '☆ Mark for review'}</button>` : ''}</div>
      ${pShow(q.p)}<p class="q" style="margin:12px 0;font-size:1.05rem"><b>${esc(q.q)}</b></p>${opts}
      ${revealed ? `<div class="explain"><b>${sel === q.a ? '✓ Correct.' : '✗ Not quite.'}</b> ${esc(q.e || '')}</div>` : ''}
      <div class="row between" style="margin-top:14px"><div class="row"><button class="btn" data-a="qprev" ${i === s.from ? 'disabled' : ''}>‹ Prev</button>
        ${Q.instant ? '' : `<button class="btn" data-a="qclear" ${sel === null ? 'disabled' : ''}>Clear</button>`}<button class="btn" data-a="qnext" ${isLastInSec ? 'disabled' : ''}>Next ›</button></div>
        <button class="btn p" data-a="qsubmit">${Q.sec === Q.sections.length - 1 ? 'Finish' : 'Submit section'}</button></div></div>
    <div class="card"><h3>Questions</h3><div class="pal">${pal.join('')}</div><small class="mut">Green = answered${Q.timed ? ', orange = marked' : ''}</small></div></div>`;
  };
  A.actions.qgo = el => { touch(); Q.cur = +el.dataset.i; Q.qStart = Date.now(); A.render(); };
  A.actions.qnext = () => { touch(); Q.cur++; Q.qStart = Date.now(); A.render(); };
  A.actions.qprev = () => { touch(); Q.cur--; Q.qStart = Date.now(); A.render(); };
  A.actions.qclear = () => { Q.ans[Q.cur] = null; A.render(); };
  A.actions.qmark = () => { Q.mark[Q.cur] = !Q.mark[Q.cur]; A.render(); };
  A.actions.qsubmit = () => submitSection(false);
  A.actions.qpick = el => { if (Q.instant && Q.ans[Q.cur] !== null) return; Q.ans[Q.cur] = +el.dataset.k; if (Q.instant) { touch(); record(Q.cur); A.save(); } A.render(); };
  document.addEventListener('keydown', e => {
    if (!A.quizLive() || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (['1', '2', '3', '4'].includes(e.key)) { const b = document.querySelectorAll('.opt')[+e.key - 1]; if (b && !b.disabled) b.click(); }
    else if (e.key === 'ArrowRight') { const b = document.querySelector('[data-a=qnext]'); if (b && !b.disabled) b.click(); }
    else if (e.key === 'ArrowLeft') { const b = document.querySelector('[data-a=qprev]'); if (b && !b.disabled) b.click(); }
  });

  /* ---------- Result ---------- */
  let rFilter = 'all';
  V.result = () => {
    if (!Q || !Q.finished) return `<div class="card"><h2>No recent test</h2><a class="btn p" href="#/mock">Take a mock</a></div>`;
    const r = Q.result, pct = Math.round(r.score / r.max * 100);
    const items = Q.qs.map((q, i) => ({ q, i, a: Q.ans[i] })).filter(x => rFilter === 'all' || (rFilter === 'wrong' && x.a !== null && x.a !== x.q.a) || (rFilter === 'skip' && x.a === null));
    const tr = Object.entries(r.topics).map(([id, v]) => ({ id, n: (TOPIC_BY_ID[id] || {}).n || id, ...v })).sort((a, b) => (a.c / (a.t || 1)) - (b.c / (b.t || 1)));
    return `<h1>${esc(r.name)}: results</h1>
    <div class="grid g4"><div class="card stat"><b>${r.score}/${r.max}</b><span>score${r.neg ? ' (negative marking ' + r.neg + ')' : ''}</span></div><div class="card stat"><b>${pct}%</b><span>of maximum</span></div>
      <div class="card stat"><b>${r.secs.reduce((a, s) => a + s.correct, 0)}</b><span>correct</span></div><div class="card stat"><b>${mm(r.timeSec)}</b><span>time taken</span></div></div>
    <div class="card"><h3>Sections</h3><table class="t"><tr><th>Section</th><th>Correct</th><th>Wrong</th><th>Skipped</th><th>Score</th><th>Time</th></tr>${r.secs.map(s => `<tr><td>${esc(s.name)}</td><td>${s.correct}</td><td>${s.wrong}</td><td>${s.skip}</td><td>${s.score}/${s.total}</td><td>${mm(s.time)}</td></tr>`).join('')}</table></div>
    <div class="card"><h3>By topic (weakest first)</h3><table class="t"><tr><th>Topic</th><th>Correct</th><th>Accuracy</th></tr>${tr.filter(x => x.t).map(x => `<tr><td>${esc(x.n)}</td><td>${x.c}/${x.t}</td><td>${Math.round(x.c / x.t * 100)}%</td></tr>`).join('')}</table>
      <p class="mut">Wrong answers were added to your <a href="#/errors">Error Notebook</a>. Check each wrong question: concept gap, calculation slip, misread, or time pressure?</p></div>
    <div class="row" style="margin:14px 0"><a class="btn p" href="#/mock">Another test</a><a class="btn" href="#/errors">Error Notebook</a><a class="btn" href="#/progress">Progress</a></div>
    <div class="chips" style="margin-bottom:10px">${['all', 'wrong', 'skip'].map(f => `<button class="chip ${rFilter === f ? 'on' : ''}" data-a="rfilter" data-v="${f}">${{ all: 'All', wrong: 'Wrong', skip: 'Skipped' }[f]}</button>`).join('')}</div>
    ${items.map(({ q, i, a }) => `<div class="card" style="margin-bottom:12px"><small>Q${i + 1} · ${esc((TOPIC_BY_ID[q.t] || {}).n || '')} · ${a === null ? 'skipped' : a === q.a ? '✓ correct' : '✗ wrong'} · ${Math.round(Q.time[i])}s</small>${pShow(q.p)}<p class="q"><b>${esc(q.q)}</b></p>
      ${q.o.map((o, k) => `<div class="opt ${k === q.a ? 'right' : k === a ? 'wrong' : ''}" style="cursor:default"><b>${L[k]}</b><span>${esc(o)}${k === a ? ' (your answer)' : ''}</span></div>`).join('')}<div class="explain">${esc(q.e || '')}</div></div>`).join('') || '<p class="mut">Nothing in this filter.</p>'}`;
  };
  A.actions.rfilter = el => { rFilter = el.dataset.v; A.render(); };

  /* ---------- Mocks ---------- */
  const MOCKS = {
    prelims: { title: 'Full Prelims mock', desc: 'Reasoning 35 · Quant 35 · English 30 (qualifying). 60 minutes, 20-minute sectional timers.', mins: 60, build: () => [sec('Reasoning Ability', 'RE', topicsOf('RE'), 35, 20), sec('Quantitative Aptitude', 'QA', topicsOf('QA'), 35, 20), sec('English Language', 'EN', EN_TOPICS(), 30, 20)] },
    sectional: { title: 'Weekly sectional test', desc: 'Reasoning 20 + Quant 20 from topics you have covered so far. 40 minutes.', mins: 40, build: () => { const n = A.dayNo(); const covered = [...new Set(PLAN.filter(d => d.n <= Math.max(7, n) && d.topic).map(d => d.topic))]; const ids = s => { const l = covered.filter(t => TOPIC_BY_ID[t].s === s); return l.length ? l : topicsOf(s); }; return [sec('Reasoning (covered topics)', 'RE', ids('RE'), 20, 20), sec('Quant (covered topics)', 'QA', ids('QA'), 20, 20)]; } },
    mains: { title: 'Mains-style objective mock', desc: 'Reasoning 25 · Quant & DI 25 · GK 25 · Insurance & Finance 25 (practice format, 25 minutes each). Check the notification for the real mains pattern.', mins: 100, build: () => [sec('Reasoning', 'RE', topicsOf('RE'), 25, 25), sec('Quant & DI', 'QA', topicsOf('QA'), 25, 25), sec('General Awareness', 'GK', topicsOf('GK'), 25, 25), sec('Insurance & Financial Awareness', 'INS', topicsOf('INS'), 25, 25)] },
    awareness: { title: 'GK + Insurance awareness test', desc: 'GK 20 + Insurance & Finance 30. 30 minutes. Great for the weekly GK day.', mins: 30, build: () => [sec('General Awareness', 'GK', topicsOf('GK'), 20, 12), sec('Insurance & Financial Awareness', 'INS', topicsOf('INS'), 30, 18)] },
  };
  V.mock = (p, q) => {
    const hist = S.mocks.slice().reverse();
    const pts = S.mocks.map((m, i) => ({ x: i, y: Math.round(m.score / m.max * 100), l: m.name + ' ' + m.date }));
    return `<h1>Mock tests</h1>
    <div class="card"><div class="row between"><div><b>Negative marking:</b> ${+S.neg ? S.neg + ' per wrong answer' : 'off'} <small class="mut">(change in Settings; verify in the notification)</small></div><a class="btn sm" href="#/settings">Settings</a></div></div>
    <div class="grid g2" style="margin-top:16px">${Object.entries(MOCKS).map(([k, m]) => `<div class="card ${q.type === k ? 'hero' : ''}"><h3>${m.title}</h3><p class="mut">${m.desc}</p><button class="btn p" data-a="startMock" data-k="${k}">Start (${m.mins} min)</button></div>`).join('')}</div>
    <div class="notice">The built-in questions are a practice bank, not LIC's real papers. Use these mocks for stamina, timing and error analysis, and also solve official previous-year papers and a trusted test series.</div>
    <div class="card"><h3>Score trend (%)</h3>${A.lineChart(pts, { max: 100, label: 'Mock score trend' })}</div>
    <div class="card"><h3>History</h3>${hist.length ? `<table class="t"><tr><th>Date</th><th>Test</th><th>Score</th><th>%</th></tr>${hist.slice(0, 30).map(m => `<tr><td>${m.date}</td><td>${esc(m.name)}</td><td>${m.score}/${m.max}</td><td>${Math.round(m.score / m.max * 100)}%</td></tr>`).join('')}</table>` : '<p class="mut">No mocks taken yet. Your first one is a baseline, not a judgement.</p>'}</div>`;
  };
  A.actions.startMock = el => { const m = MOCKS[el.dataset.k]; startQuiz({ kind: 'exam', type: el.dataset.k, name: m.title, sections: m.build(), timed: true, instant: false }); };

  /* ---------- Progress ---------- */
  V.progress = () => {
    const act = A.activity(), tot = Object.values(act).reduce((a, b) => a + b, 0);
    const qs = Object.values(S.stats).reduce((a, s) => a + s.t, 0), cs = Object.values(S.stats).reduce((a, s) => a + s.c, 0);
    const best = S.mocks.length ? Math.max(...S.mocks.map(m => Math.round(m.score / m.max * 100))) : null;
    const n = Math.min(Math.max(A.dayNo(), 0), TOTAL_DAYS); const doneDays = PLAN.filter(d => d.n <= n && A.dayProg(d.n).all).length;
    const end = A.today(), start0 = A.addDays(end, -118); const wd = new Date(start0 + 'T00:00:00').getDay(); let cells = ''.padStart(0);
    for (let i = 0; i < wd; i++) cells += '<i style="background:transparent"></i>';
    for (let i = 0; i < 119; i++) { const d = A.addDays(start0, i), m = act[d] || 0; cells += `<i class="${m >= 90 ? 'l3' : m >= 45 ? 'l2' : m > 0 ? 'l1' : ''}" title="${d}: ${m} min"></i>`; }
    const bars = Array.from({ length: 14 }, (_, i) => { const d = A.addDays(end, i - 13); return { y: +((act[d] || 0) / 60).toFixed(1), l: d, s: d.slice(8) }; });
    const subj = Object.keys(SUBJ).map(k => { const a = A.subjAcc(k); const lst = TOPICS.filter(t => t.s === k); const dn = lst.filter(t => ['Revised', 'Mastered'].includes(S.topics[t.id])).length; return `<tr><td>${A.subjTag(k)}</td><td>${a.pct === null ? '–' : a.pct + '%'} <small class="mut">(${a.t} Qs)</small></td><td>${dn}/${lst.length}</td></tr>`; }).join('');
    const weak = A.weakTopics();
    return `<h1>Progress</h1>
    <div class="grid g4"><div class="card stat"><b>${A.streak()} 🔥</b><span>day streak</span></div><div class="card stat"><b>${A.fmtMin(tot)}</b><span>total study time logged</span></div><div class="card stat"><b>${qs ? Math.round(cs / qs * 100) + '%' : '–'}</b><span>accuracy over ${qs} questions</span></div><div class="card stat"><b>${best === null ? '–' : best + '%'}</b><span>best mock (${S.mocks.length} taken)</span></div></div>
    <div class="card"><h3>Plan adherence</h3><p>${doneDays} of ${n} elapsed days fully completed.</p><div class="bar"><i style="width:${n ? doneDays / n * 100 : 0}%"></i></div></div>
    <div class="card"><h3>Activity (last 17 weeks)</h3><div class="heat">${cells}</div><small class="mut">Darker = more minutes. Check boxes, timer sessions and practice all count.</small></div>
    <div class="grid g2"><div class="card"><h3>Hours per day (last 14 days)</h3>${A.barChart(bars, { label: 'Hours per day' })}</div><div class="card"><h3>Mock scores (%)</h3>${A.lineChart(S.mocks.map((m, i) => ({ x: i, y: Math.round(m.score / m.max * 100), l: m.name })), { max: 100, label: 'Mock scores' })}</div></div>
    <div class="card"><h3>By subject</h3><table class="t"><tr><th>Subject</th><th>Accuracy</th><th>Topics revised</th></tr>${subj}</table></div>
    <div class="card"><h3>Weak topics (below 70% after 5+ questions)</h3>${weak.length ? `<ul class="clean">${weak.map(w => `<li class="row between"><span>${esc(w.t.n)} <span class="pill bad">${Math.round(w.s.c / w.s.t * 100)}%</span></span><span><a class="btn sm" href="#/topic/${w.t.id}">Notes</a> <a class="btn sm p" href="#/practice?topic=${w.t.id}&n=15">Practise</a></span></li>`).join('')}</ul>` : '<p class="mut">None yet. Answer more practice questions and your weak areas will appear here.</p>'}</div>`;
  };

  /* ---------- Error notebook ---------- */
  let eFilter = 'ALL';
  V.errors = () => {
    const list = S.errors.filter(e => eFilter === 'ALL' || e.s === eFilter).sort((a, b) => b.count - a.count);
    const chip = (v, l) => `<button class="chip ${eFilter === v ? 'on' : ''}" data-a="efilter" data-v="${v}">${l}</button>`;
    return `<h1>Error Notebook</h1><p class="mut">Every wrong answer lands here. Retry them until you get each one right twice; it then leaves the notebook.</p>
    <div class="row between"><div class="chips">${chip('ALL', 'All (' + S.errors.length + ')')}${Object.keys(SUBJ).map(k => chip(k, SUBJ[k].short)).join('')}</div>
    <button class="btn p" data-a="retryErrors" ${list.length ? '' : 'disabled'}>Retry ${Math.min(15, list.length)} now</button></div>
    <div style="margin-top:14px">${list.map(e => `<div class="card" style="margin-bottom:12px"><div class="row between"><small>${A.subjTag(e.s)} ${esc((TOPIC_BY_ID[e.t] || {}).n || '')} · wrong ${e.count}× · ${e.date}</small><button class="btn sm d" data-a="delErr" data-id="${e.id}">Remove</button></div>${pShow(e.p)}<p class="q"><b>${esc(e.q)}</b></p>
      <details><summary>Show answer &amp; explanation</summary>${e.o.map((o, k) => `<div class="opt ${k === e.a ? 'right' : ''}" style="cursor:default"><b>${L[k]}</b><span>${esc(o)}</span></div>`).join('')}<div class="explain">${esc(e.e || '')}</div></details>
      <div class="field"><label>Why did I get it wrong?</label><input type="text" data-i="errnote" data-id="${e.id}" value="${esc(e.note || '')}" placeholder="concept gap / calculation slip / misread / time"></div></div>`).join('') || '<div class="card"><p>Nothing here. Either you have been perfect or you have not practised yet. 😄</p><a class="btn p" href="#/practice">Practise now</a></div>'}</div>`;
  };
  A.actions.efilter = el => { eFilter = el.dataset.v; A.render(); };
  A.actions.delErr = el => { S.errors = S.errors.filter(e => e.id !== el.dataset.id); A.save(); reload(); };
  A.inputs.errnote = el => { const e = S.errors.find(x => x.id === el.dataset.id); if (e) { e.note = el.value; A.save(); } };
  A.actions.retryErrors = () => {
    const list = S.errors.filter(e => eFilter === 'ALL' || e.s === eFilter).sort((a, b) => b.count - a.count).slice(0, 15);
    startQuiz({ kind: 'practice', type: 'errors', name: 'Error Notebook retry', sections: [{ name: 'Retry', qs: list.map(e => ({ id: e.id, t: e.t, s: e.s, q: e.q, p: e.p, o: e.o, a: e.a, e: e.e })), mins: 20 }], timed: false, instant: true });
  };
})();
