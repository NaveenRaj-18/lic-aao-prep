/* Views: Today, Plan, Day, Learn, Topic, More */
(function () {
  const A = APP, S = A.state, V = A.views, esc = A.esc;
  const STATUS = ['Not started', 'Learning', 'Revised', 'Mastered'];
  const QUOTES = ['Small daily steps beat occasional sprints.', 'Accuracy first, speed will follow.', 'Every mistake you log today is a mark you save in the exam.', 'You don\'t need to be perfect, you need to be consistent.', 'Revision is where marks are made.', 'Do the next 90 minutes. Nothing else matters right now.', 'Discipline is choosing what you want most over what you want now.', 'A tough topic today is an easy question tomorrow.', 'Rest is part of the plan. Sleep protects your memory.'];
  const reload = () => { const y = window.scrollY; A.render(); window.scrollTo(0, y); };

  /* ---------- shared UI ---------- */
  function blocksHtml(n) {
    const d = PLAN[n - 1], st = S.days[n] || { done: {} };
    let off = 0;
    return `<div class="blocks">${d.blocks.map(b => {
      const t0 = A.clock(S.startTime, off); off += b.mins; const t1 = A.clock(S.startTime, off);
      const done = !!(st.done && st.done[b.id]);
      return `<div class="block ${done ? 'done' : ''}">
        <input type="checkbox" data-c="blk" data-n="${n}" data-id="${b.id}" ${done ? 'checked' : ''} aria-label="Mark done: ${esc(b.label)}">
        <div class="tm">${t0}–${t1}<br>${b.mins} min</div>
        <div><div class="bt">${esc(b.label)}</div><div class="bd">${esc(b.desc)}</div></div>
        ${b.link ? `<a class="btn sm" href="${b.link}">Open ›</a>` : '<span></span>'}
      </div>`;
    }).join('')}</div>`;
  }
  A.changes.blk = el => {
    const n = +el.dataset.n, st = A.dayState(n);
    if (el.checked) st.done[el.dataset.id] = A.today(); else delete st.done[el.dataset.id];
    A.save(); reload();
    if (el.checked && A.dayProg(n).all) A.toast('Day complete! 🎉 Add your check-in below.');
  };

  function topicSummaryCard(t, compact) {
    const how = HOW[t.s];
    return `<div class="card"><div class="row between"><h2>${A.subjTag(t.s)} ${esc(t.n)}</h2><a class="btn sm" href="#/topic/${t.id}">Full notes ›</a></div>
      <h3>Key points</h3><ul class="pts">${t.pts.slice(0, compact ? 3 : 9).map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      ${t.f.length ? `<h3>Formulas &amp; rules</h3>${t.f.slice(0, compact ? 4 : 20).map(f => `<div class="formula">${esc(f)}</div>`).join('')}` : ''}
      <h3>How to learn it</h3><ol class="pts">${how.learn.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
      <h3>How to practise it</h3><ol class="pts">${how.practice.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
      <p><b>Target:</b> ${esc(t.tg)}</p></div>`;
  }

  /* ---------- onboarding ---------- */
  function onboarding() {
    return `<div class="card hero"><h1>Welcome 👋</h1><p>This site is your complete 24-week plan for the <b>LIC AAO (Generalist)</b> exam: daily time blocks, notes, practice, mock tests, check-ins and progress tracking. Everything is saved in your browser.</p></div>
    <div class="card"><h2>Set up your plan</h2>
      <div class="field"><label for="ob-start">Day 1 is</label><input id="ob-start" type="date" value="${A.today()}"></div>
      <div class="field"><label for="ob-time">Daily study start time (90-minute block)</label><input id="ob-time" type="time" value="${S.startTime}"></div>
      <div class="field"><label for="ob-exam">Exam date (optional, add it once LIC announces it)</label><input id="ob-exam" type="date"></div>
      <button class="btn p" data-a="startPlan">Start my plan</button>
      <p class="notice">The pattern, syllabus and dates here are based on the previous (2025) cycle. Always confirm with the official notification at licindia.in.</p></div>`;
  }
  A.actions.startPlan = () => {
    S.start = document.getElementById('ob-start').value || A.today();
    S.startTime = document.getElementById('ob-time').value || '19:00';
    S.exam = document.getElementById('ob-exam').value || '';
    A.save(); A.toast('Plan started. Let\'s go!'); A.render();
  };

  /* ---------- Today ---------- */
  V[''] = () => {
    if (!S.start) return onboarding();
    const n = A.dayNo(), streak = A.streak();
    if (n < 1) return `<div class="card hero"><h1>Your plan starts in ${1 - n} day${1 - n === 1 ? '' : 's'}</h1><p>Day 1 is ${A.fmtDate(S.start)}. Use the time to explore the Exam Guide and set up your study space.</p><a class="btn p" href="#/guide">Open Exam Guide</a> <a class="btn" href="#/plan">See the full plan</a></div>`;
    if (n > TOTAL_DAYS) return `<div class="card hero"><h1>You've completed the 24-week plan 🎓</h1><p>Keep taking mocks, revise your Error Notebook and read daily current affairs until the exam.</p><a class="btn p" href="#/mock">Take a mock</a></div>`;
    const d = PLAN[n - 1], prog = A.dayProg(n), ph = A.phaseOf(n);
    const act = A.activity(); const week0 = A.addDays(A.today(), -6); let wk = 0; for (let i = 0; i < 7; i++) wk += act[A.addDays(week0, i)] || 0;
    const completed = PLAN.filter(x => x.n <= n && A.dayProg(x.n).all).length;
    const mocks = S.mocks; const avg = mocks.length ? Math.round(mocks.slice(-3).reduce((a, m) => a + m.score / m.max * 100, 0) / Math.min(3, mocks.length)) : null;
    const due = Object.values(S.vocab).filter(v => v.due <= A.today()).length, errs = S.errors.length;
    const toDo = d.blocks.find(b => !(S.days[n] && S.days[n].done[b.id]));
    const exam = S.exam ? A.diffDays(A.today(), S.exam) : null;
    const missed = Math.max(0, n - 1 - PLAN.filter(x => x.n < n && A.dayProg(x.n).all).length);
    return `<div class="card hero">
      <div class="row between"><div><small>Phase ${ph.n}: ${ph.name} · Week ${d.week} of 24</small><h1 style="margin:.15em 0">Day ${n}: ${esc(d.title)}</h1><p class="mut">${esc(d.goal)}</p></div>
      <div style="text-align:right"><div class="big">${prog.pct}%</div><small>of today done · ${A.fmtMin(d.total)} planned</small></div></div>
      <div class="bar" style="margin:10px 0 14px"><i style="width:${prog.pct}%;background:#fff"></i></div>
      <div class="row">${toDo && toDo.link ? `<a class="btn p" href="${toDo.link}">Next: ${esc(toDo.label)} ›</a>` : ''}<a class="btn" href="#/day/${n}">Open full day</a>${exam !== null ? `<span class="pill" style="background:rgba(255,255,255,.2);color:#fff">${exam >= 0 ? exam + ' days to exam' : 'Exam date passed'}</span>` : ''}</div></div>
    <div class="grid g4" style="margin-top:16px">
      <div class="card stat"><b>${streak} 🔥</b><span>day streak</span></div>
      <div class="card stat"><b>${completed}/${n}</b><span>days fully completed</span></div>
      <div class="card stat"><b>${A.fmtMin(wk)}</b><span>studied in last 7 days</span></div>
      <div class="card stat"><b>${avg === null ? '–' : avg + '%'}</b><span>recent mock average</span></div></div>
    ${missed >= 2 ? `<div class="notice">You have ${missed} unfinished day${missed > 1 ? 's' : ''}. Don't try to cram them all. Use <a href="#/settings">Settings → Shift plan</a> to move the schedule, or finish key blocks first.</div>` : ''}
    <div class="card"><div class="row between"><h2>Today's time blocks · starts ${S.startTime}</h2><a href="#/day/${n}">Check-in &amp; notes ›</a></div>${blocksHtml(n)}
      <p class="mut"><em>“${QUOTES[n % QUOTES.length]}”</em></p></div>
    <div class="grid g3">
      <a class="card" href="#/vocab" style="color:inherit;text-decoration:none"><h3>🔤 Flashcards</h3><p class="mut">${due} due today</p></a>
      <a class="card" href="#/errors" style="color:inherit;text-decoration:none"><h3>📓 Error Notebook</h3><p class="mut">${errs} to master</p></a>
      <a class="card" href="#/timer" style="color:inherit;text-decoration:none"><h3>🍅 Focus timer</h3><p class="mut">25/5 pomodoro, logs study time</p></a></div>`;
  };

  /* ---------- Day ---------- */
  V.day = p => {
    if (!S.start) return onboarding();
    const n = Math.min(TOTAL_DAYS, Math.max(1, +p || A.dayNo() || 1)), d = PLAN[n - 1], st = S.days[n] || {}, ci = st.ci || {}, prog = A.dayProg(n);
    const date = A.dayDate(n), t = d.topic ? TOPIC_BY_ID[d.topic] : null;
    const defHours = ci.hours ?? +(prog.done / 60).toFixed(2);
    const chips = (name, vals, cur) => `<div class="chips">${vals.map(v => `<button type="button" class="chip ${String(cur) === String(v) ? 'on' : ''}" data-a="ciPick" data-k="${name}" data-v="${v}">${v}</button>`).join('')}</div>`;
    return `<div class="crumbs"><a href="#/plan">Plan</a> › Day ${n}</div>
    <div class="row between"><div><small>${A.fmtDate(date)} · Week ${d.week} · Phase ${A.phaseOf(n).n}</small><h1>Day ${n}: ${esc(d.title)}</h1></div>
      <div class="row"><a class="btn sm" href="#/day/${Math.max(1, n - 1)}">‹ Prev</a><a class="btn sm" href="#/day/${Math.min(TOTAL_DAYS, n + 1)}">Next ›</a></div></div>
    <div class="card"><div class="row between"><h2>Time blocks</h2>${A.subjTag(d.subj)}</div><div class="bar"><i style="width:${prog.pct}%"></i></div><small>${prog.done}/${d.total} min completed</small>${blocksHtml(n)}</div>
    <div class="card"><h2>Daily check-in</h2>
      <div class="field"><label for="ci-h">Hours studied</label><input id="ci-h" type="number" step="0.25" min="0" max="16" value="${defHours}"></div>
      <div class="field"><label>Focus today (1 = scattered, 5 = locked in)</label>${chips('focus', [1, 2, 3, 4, 5], ci.focus)}</div>
      <div class="field"><label>Mood</label>${chips('mood', ['😀', '🙂', '😐', '😟', '😴'], ci.mood)}</div>
      <div class="field"><label for="ci-n">What did you learn? What was hard? What will you fix tomorrow?</label><textarea id="ci-n">${esc(ci.note || '')}</textarea></div>
      <div class="row"><button class="btn p" data-a="saveCi" data-n="${n}">Save check-in</button>
      <button class="btn" data-a="completeDay" data-n="${n}">${ci.complete ? '✓ Day marked complete' : 'Mark day complete'}</button>${ci.date ? `<small>Saved ${A.fmtDate(ci.date)}</small>` : ''}</div></div>
    ${t ? topicSummaryCard(t, true) : d.kind === 'test' || d.kind === 'mock' ? `<div class="card"><h2>How to use a test day</h2><ol class="pts"><li>Take the test in exam conditions: no phone, no notes, a timer running.</li><li>Don't check answers question by question. Finish the whole test first.</li><li>Classify each mistake: <b>concept gap</b>, <b>calculation slip</b>, <b>misread</b> or <b>out of time</b>.</li><li>Redo each wrong question after one hour without looking at the solution.</li><li>Write one line in your check-in note: "The one thing I'll change next test is…"</li></ol></div>` : ''}`;
  };
  A.actions.ciPick = el => { const n = +location.hash.split('/')[2]; const st = A.dayState(n); st.ci = st.ci || {}; st.ci[el.dataset.k] = el.dataset.v; A.save(); reload(); };
  const readCi = n => { const st = A.dayState(n); st.ci = st.ci || {}; st.ci.hours = +document.getElementById('ci-h').value || 0; st.ci.note = document.getElementById('ci-n').value; st.ci.date = A.today(); return st; };
  A.actions.saveCi = el => { const n = +el.dataset.n; readCi(n); A.save(); A.toast('Check-in saved ✓'); reload(); };
  A.actions.completeDay = el => { const n = +el.dataset.n, st = readCi(n); st.ci.complete = !st.ci.complete; A.save(); A.toast(st.ci.complete ? 'Day marked complete ✓' : 'Unmarked'); reload(); };

  /* ---------- Plan ---------- */
  V.plan = () => {
    if (!S.start) return onboarding();
    const cur = A.dayNo();
    const weeks = Array.from({ length: 24 }, (_, i) => i + 1).map(w => {
      const ds = PLAN.filter(d => d.week === w);
      const cells = ds.map(d => { const p = A.dayProg(d.n); return `<a class="dd ${p.all || (S.days[d.n] && S.days[d.n].ci && S.days[d.n].ci.complete) ? 'done' : p.any ? 'part' : ''} ${d.n === cur ? 'today' : ''}" href="#/day/${d.n}" title="Day ${d.n}: ${esc(d.title)}">${d.n}</a>`; }).join('');
      return `<div class="wk"><h3>Week ${w}</h3><small>${esc(WEEK_GOALS[w - 1])}</small><div class="days" style="margin-top:8px">${cells}</div></div>`;
    });
    return `<h1>24-week study plan</h1>
    <p class="mut">Rhythm: Day 1 Quant · 2 Reasoning · 3 English · 4 Quant · 5 Reasoning · 6 GK &amp; Insurance · 7 Test &amp; review. About 90 minutes on study days and 120+ on test days.</p>
    <div class="grid g3">${PHASES.map(p => `<div class="card"><span class="pill ${cur >= p.from && cur <= p.to ? 'ok' : ''}">Phase ${p.n} · Days ${p.from}–${p.to}</span><h3 style="margin-top:8px">${p.name}</h3><p class="mut">${p.desc}</p></div>`).join('')}</div>
    <div class="row" style="margin:16px 0"><a class="btn" data-a="ics">📅 Download calendar (.ics)</a><button class="btn" data-a="print">🖨️ Print plan</button></div>
    <div class="weeks">${weeks.join('')}</div>
    <p class="mut" style="margin-top:12px">Green = complete, yellow = partly done, outlined = today. Click any day for its blocks, notes and check-in.</p>`;
  };
  A.actions.ics = () => {
    const f = s => s.replace(/-/g, ''); const pad = n => String(n).padStart(2, '0');
    const [h, m] = S.startTime.split(':').map(Number);
    let out = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AAO Prep Studio//EN\r\n';
    PLAN.forEach(d => {
      const date = A.dayDate(d.n), end = h * 60 + m + d.total;
      const desc = d.blocks.map(b => `- ${b.label} (${b.mins} min)`).join('\\n');
      out += `BEGIN:VEVENT\r\nUID:aao-day-${d.n}@aaoprep\r\nDTSTAMP:${f(A.today())}T000000\r\nDTSTART:${f(date)}T${pad(h)}${pad(m)}00\r\nDTEND:${f(date)}T${pad(Math.floor(end / 60) % 24)}${pad(end % 60)}00\r\nSUMMARY:AAO Day ${d.n}: ${d.title.replace(/[,;]/g, ' ')}\r\nDESCRIPTION:${desc.replace(/[,;]/g, ' ')}\r\nBEGIN:VALARM\r\nTRIGGER:-PT15M\r\nACTION:DISPLAY\r\nDESCRIPTION:Study time\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
    });
    A.download('lic-aao-study-plan.ics', out + 'END:VCALENDAR\r\n', 'text/calendar'); A.toast('Calendar file downloaded');
  };

  /* ---------- Learn ---------- */
  let learnFilter = 'ALL';
  V.learn = () => {
    const list = TOPICS.filter(t => learnFilter === 'ALL' || t.s === learnFilter);
    const done = TOPICS.filter(t => S.topics[t.id] === 'Mastered' || S.topics[t.id] === 'Revised').length;
    const chip = (v, l) => `<button class="chip ${learnFilter === v ? 'on' : ''}" data-a="learnF" data-v="${v}">${l}</button>`;
    const scheduled = id => { const d = PLAN.find(x => x.topic === id); return d ? d.n : null; };
    return `<h1>Syllabus &amp; notes</h1>
    <div class="card"><div class="row between"><b>${done} of ${TOPICS.length} topics revised or mastered</b><span class="mut">${Math.round(done / TOPICS.length * 100)}%</span></div><div class="bar" style="margin-top:8px"><i style="width:${done / TOPICS.length * 100}%"></i></div></div>
    <div class="chips" style="margin:14px 0">${chip('ALL', 'All')}${Object.keys(SUBJ).map(k => chip(k, SUBJ[k].icon + ' ' + SUBJ[k].short)).join('')}</div>
    <div class="grid g2">${list.map(t => { const st = S.topics[t.id] || 'Not started', a = S.stats[t.id], sd = scheduled(t.id); return `<a class="card" href="#/topic/${t.id}" style="color:inherit;text-decoration:none">
      <div class="row between">${A.subjTag(t.s)}<span class="pill ${st === 'Mastered' ? 'ok' : st === 'Learning' ? 'warn' : ''}">${st}</span></div>
      <h3 style="margin-top:8px">${esc(t.n)}</h3><small>${sd ? 'Plan day ' + sd + ' · ' : ''}${a ? Math.round(a.c / a.t * 100) + '% accuracy (' + a.t + ' Qs)' : 'No practice yet'}</small></a>`; }).join('')}</div>`;
  };
  A.actions.learnF = el => { learnFilter = el.dataset.v; A.render(); };

  V.topic = id => {
    const t = TOPIC_BY_ID[id]; if (!t) return V.notfound();
    const st = S.topics[id] || 'Not started', a = S.stats[id];
    const days = PLAN.filter(d => d.topic === id).map(d => `<a href="#/day/${d.n}">Day ${d.n}</a>`).join(', ');
    return `<div class="crumbs"><a href="#/learn">Learn</a> › ${esc(t.n)}</div>
    <div class="row between"><h1>${esc(t.n)}</h1>${A.subjTag(t.s)}</div>
    <div class="card"><b>Status:</b> <div class="chips" style="margin-top:8px">${STATUS.map(s => `<button class="chip ${st === s ? 'on' : ''}" data-a="setStatus" data-id="${id}" data-v="${s}">${s}</button>`).join('')}</div>
      <p class="mut">${a ? `Practice accuracy: ${Math.round(a.c / a.t * 100)}% over ${a.t} questions.` : 'No practice questions answered yet.'} ${days ? 'Scheduled on ' + days + '.' : ''}</p>
      <div class="row"><a class="btn p" href="#/practice?topic=${id}&n=10">Practice 10 Qs</a><a class="btn" href="#/practice?topic=${id}&n=25">Timed set (25)</a></div></div>
    ${topicSummaryCard(t, false)}
    ${t.tr.length ? `<div class="card"><h3>⚠️ Common traps</h3><ul class="pts">${t.tr.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p><b>Exam tip:</b> ${esc(HOW[t.s].tip)}</p></div>` : ''}
    <div class="card"><h3>📝 My notes</h3><textarea data-i="note" data-id="${id}" placeholder="Your own shortcuts, examples, mistakes to avoid...">${esc(S.notes[id] || '')}</textarea><small class="mut">Saved automatically in this browser.</small></div>`;
  };
  A.actions.setStatus = el => { S.topics[el.dataset.id] = el.dataset.v; A.save(); reload(); };
  A.inputs.note = el => { S.notes[el.dataset.id] = el.value; A.save(); };

  /* ---------- More / not found ---------- */
  V.more = () => `<h1>More</h1><div class="grid g2">${A.NAV.slice(5).map(([r, i, n]) => `<a class="card" href="#/${r}" style="color:inherit;text-decoration:none"><h3>${i} ${n}</h3></a>`).join('')}</div>`;
  V.notfound = () => `<div class="card"><h2>Page not found</h2><a class="btn" href="#/">Back to Today</a></div>`;
  A.topicSummaryCard = topicSummaryCard;
})();
