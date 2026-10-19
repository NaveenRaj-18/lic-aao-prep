/* Views: Vocabulary, Writing Lab, Current Affairs, Timer, Formulas, Exam Guide, Settings */
(function () {
  const A = APP, S = A.state, V = A.views, esc = A.esc;
  const reload = () => { const y = window.scrollY; A.render(); window.scrollTo(0, y); };
  const INTERVALS = [0, 1, 3, 7, 15, 30];

  /* ---------- Vocabulary (Leitner flashcards) ---------- */
  let vSession = [], vFlip = false, vTab = 'review';
  V.vocab = () => {
    const t = A.today(), due = Object.keys(S.vocab).filter(w => S.vocab[w].due <= t);
    vSession = vSession.filter(w => S.vocab[w] && S.vocab[w].due <= t);
    due.forEach(w => { if (!vSession.includes(w)) vSession.push(w); });
    const learned = Object.values(S.vocab).filter(v => v.box >= 3).length;
    const tab = (k, l) => `<button class="chip ${vTab === k ? 'on' : ''}" data-a="vtab" data-v="${k}">${l}</button>`;
    let body = '';
    if (vTab === 'review') {
      const w = vSession[0], e = w && VOCAB.find(x => x[0] === w);
      body = e ? `<div class="card flash" data-a="vflip" role="button" tabindex="0"><div>${esc(e[0])}${vFlip ? `<small>Synonym: <b>${esc(e[1])}</b> · Antonym: <b>${esc(e[2])}</b></small>` : '<small>Tap to reveal</small>'}</div></div>
        <div class="row" style="margin-top:12px;justify-content:center"><button class="btn" data-a="vflip">${vFlip ? 'Hide' : 'Show answer'}</button><button class="btn d" data-a="vgrade" data-g="0" ${vFlip ? '' : 'disabled'}>Again</button><button class="btn p" data-a="vgrade" data-g="1" ${vFlip ? '' : 'disabled'}>Got it</button></div><p class="mut" style="text-align:center">${vSession.length} card(s) left today</p>`
        : `<div class="card"><h3>No cards due 🎉</h3><p class="mut">Add 5 new words to start today's learning, or come back tomorrow.</p><button class="btn p" data-a="vnew">Add 5 new words</button></div>`;
    } else if (vTab === 'browse') {
      body = `<div class="card"><input type="text" placeholder="Search words…" data-i="vsearch" aria-label="Search words"><table class="t" id="vtable" style="margin-top:10px"><tr><th>Word</th><th>Synonym</th><th>Antonym</th><th>Box</th></tr>${VOCAB.map(v => `<tr data-w="${v[0]} ${v[1]} ${v[2]}"><td><b>${v[0]}</b></td><td>${v[1]}</td><td>${v[2]}</td><td>${S.vocab[v[0]] ? S.vocab[v[0]].box : '–'}</td></tr>`).join('')}</table></div>`;
    } else {
      body = `<div class="card"><h3>Test yourself</h3><p>Take a quick synonym/antonym quiz from the same word list.</p><a class="btn p" href="#/practice?topic=e_vocab&n=15">Vocabulary quiz (15)</a></div>`;
    }
    return `<h1>Vocabulary</h1><div class="grid g3"><div class="card stat"><b>${VOCAB.length}</b><span>words in deck</span></div><div class="card stat"><b>${Object.keys(S.vocab).length}</b><span>started</span></div><div class="card stat"><b>${learned}</b><span>well learned (box 3+)</span></div></div>
    <div class="chips" style="margin:14px 0">${tab('review', 'Review (' + vSession.length + ')')}<button class="chip" data-a="vnew">+ 5 new words</button>${tab('browse', 'Browse all')}${tab('quiz', 'Quiz')}</div>${body}
    <p class="mut">Spaced repetition: "Got it" moves a card up one box (1, 3, 7, 15, 30 days). "Again" resets it to tomorrow's early review.</p>`;
  };
  A.actions.vtab = el => { vTab = el.dataset.v; A.render(); };
  A.actions.vflip = () => { vFlip = !vFlip; A.render(); };
  A.actions.vnew = () => {
    const fresh = VOCAB.filter(v => !S.vocab[v[0]]).slice(0, 5);
    if (!fresh.length) { A.toast('You have started every word in the deck.'); return; }
    fresh.forEach(v => { S.vocab[v[0]] = { box: 0, due: A.today() }; }); A.save(); vTab = 'review'; vFlip = false; A.toast(`Added: ${fresh.map(v => v[0]).join(', ')}`); A.render();
  };
  A.actions.vgrade = el => {
    const w = vSession[0], c = S.vocab[w]; if (!c) return;
    if (el.dataset.g === '1') { c.box = Math.min(5, c.box + 1); c.due = A.addDays(A.today(), INTERVALS[c.box] || 1); vSession.shift(); }
    else { c.box = 1; c.due = A.today(); vSession.push(vSession.shift()); }
    vFlip = false; A.save(); A.render();
  };
  A.inputs.vsearch = el => { const q = el.value.toLowerCase(); document.querySelectorAll('#vtable tr[data-w]').forEach(r => { r.style.display = r.dataset.w.includes(q) ? '' : 'none'; }); };

  /* ---------- Writing lab ---------- */
  let wType = 'letter', wIdx = 0, wInt = null, wEnd = 0;
  const wKey = () => 'draft_' + wType + '_' + wIdx;
  V.write = () => {
    const prompts = WRITING_PROMPTS[wType], draft = S.notes[wKey()] || '';
    const words = (draft.trim().match(/\S+/g) || []).length;
    return `<h1>Writing Lab</h1><p class="mut">The descriptive paper is typically a formal letter and an essay in English (qualifying, but it must be passed). Check the notification for marks, word limits and time.</p>
    <div class="card"><div class="chips"><button class="chip ${wType === 'letter' ? 'on' : ''}" data-a="wtype" data-v="letter">Formal letter</button><button class="chip ${wType === 'essay' ? 'on' : ''}" data-a="wtype" data-v="essay">Essay</button></div>
      <div class="field"><label for="w-p">Prompt</label><select id="w-p" data-c="wprompt">${prompts.map((p, i) => `<option value="${i}" ${i === wIdx ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></div>
      <div class="row"><button class="btn sm" data-a="wrandom">🎲 Random prompt</button><button class="btn sm" data-a="wtimer">${wEnd ? 'Stop timer' : 'Start ' + (wType === 'letter' ? 15 : 20) + '-min timer'}</button><span class="timer" id="wtimer">${wEnd ? '' : ''}</span></div>
      <div class="field"><label for="w-t">Your answer</label><textarea id="w-t" data-i="wdraft" style="min-height:280px" placeholder="Write here. Your draft is saved automatically.">${esc(draft)}</textarea><small class="mut"><span id="wc">${words}</span> words · target ${wType === 'letter' ? '150–200' : '250–300'}</small></div>
      <button class="btn p" data-a="wsave">Save to my portfolio</button></div>
    <div class="grid g2"><div class="card"><h3>Self-review checklist</h3>${['Clear structure: opening, body, closing', 'Formal tone, no contractions or slang', 'One idea per paragraph, with an example', 'Subject–verb agreement and tenses checked', 'Spelling and punctuation re-read', 'Within the word limit'].map((c, i) => `<label style="display:flex;gap:8px;margin:6px 0"><input type="checkbox"> ${c}</label>`).join('')}</div>
    <div class="card"><h3>${wType === 'letter' ? 'Formal letter format' : 'Essay structure'}</h3>${wType === 'letter' ? '<pre style="white-space:pre-wrap;font:inherit;margin:0">Sender\'s address\nDate\n\nThe [Designation]\n[Organisation, address]\n\nSubject: [one line stating the purpose]\n\nSir/Madam,\nPara 1: purpose.\nPara 2: details / reasons.\nPara 3: request / action wanted.\n\nYours faithfully,\n[Name]</pre>' : '<ol class="pts"><li><b>Introduction</b>: context and a clear stance (2–3 sentences).</li><li><b>Body 1</b>: causes / background with an example.</li><li><b>Body 2</b>: effects / challenges with data or an example.</li><li><b>Body 3</b>: solutions / the way forward.</li><li><b>Conclusion</b>: a balanced closing line.</li></ol>'}</div></div>
    <div class="card"><h3>My portfolio (${S.writings.length})</h3>${S.writings.slice().reverse().map(w => `<details><summary>${w.date} · ${w.type} · ${w.words} words — ${esc(w.prompt.slice(0, 70))}</summary><p style="white-space:pre-wrap">${esc(w.text)}</p><button class="btn sm d" data-a="wdel" data-id="${w.id}">Delete</button></details>`).join('') || '<p class="mut">Nothing saved yet.</p>'}</div>`;
  };
  A.actions.wtype = el => { wType = el.dataset.v; wIdx = 0; A.render(); };
  A.changes.wprompt = el => { wIdx = +el.value; A.render(); };
  A.actions.wrandom = () => { wIdx = Math.floor(Math.random() * WRITING_PROMPTS[wType].length); A.render(); };
  A.inputs.wdraft = el => { S.notes[wKey()] = el.value; A.save(); document.getElementById('wc').textContent = (el.value.trim().match(/\S+/g) || []).length; };
  A.actions.wsave = () => { const text = (S.notes[wKey()] || '').trim(); if (!text) { A.toast('Write something first.'); return; } S.writings.push({ id: String(Date.now()), date: A.today(), type: wType, prompt: WRITING_PROMPTS[wType][wIdx], text, words: (text.match(/\S+/g) || []).length }); A.save(); A.toast('Saved to portfolio ✓'); reload(); };
  A.actions.wdel = el => { S.writings = S.writings.filter(w => w.id !== el.dataset.id); A.save(); reload(); };
  A.actions.wtimer = () => {
    if (wEnd) { wEnd = 0; clearInterval(wInt); A.render(); return; }
    wEnd = Date.now() + (wType === 'letter' ? 15 : 20) * 60000; clearInterval(wInt);
    wInt = setInterval(() => { const el = document.getElementById('wtimer'); const left = Math.max(0, Math.round((wEnd - Date.now()) / 1000)); if (el) el.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0'); if (!left) { clearInterval(wInt); wEnd = 0; A.toast('Time is up. Stop writing and review.'); if (location.hash === '#/write') A.render(); } }, 1000);
    A.render();
  };

  /* ---------- Current affairs ---------- */
  const CA_CATS = ['Economy & Banking', 'Insurance & Finance', 'Government schemes', 'Awards & Honours', 'Sports', 'Summits & Agreements', 'Appointments', 'Science & Tech', 'International', 'Important days'];
  V.ca = () => {
    const by = {}; S.ca.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach(c => { (by[c.date.slice(0, 7)] = by[c.date.slice(0, 7)] || []).push(c); });
    return `<h1>Current Affairs log</h1><p class="mut">Spend 15 minutes a day. Write one line per fact, tagged by category, then revise by month. Cover the last 6–8 months before the exam.</p>
    <div class="card"><div class="grid g2"><div class="field"><label for="ca-d">Date</label><input id="ca-d" type="date" value="${A.today()}"></div><div class="field"><label for="ca-c">Category</label><select id="ca-c">${CA_CATS.map(c => `<option>${c}</option>`).join('')}</select></div></div>
      <div class="field"><label for="ca-t">Fact / headline</label><textarea id="ca-t" style="min-height:70px" placeholder="e.g. RBI keeps repo rate unchanged at …"></textarea></div><button class="btn p" data-a="caAdd">Add to log</button></div>
    <div class="grid g2"><div class="card"><h3>Reliable sources</h3><ul class="clean"><li><a href="https://pib.gov.in/" target="_blank" rel="noopener">PIB: government announcements</a></li><li><a href="https://www.rbi.org.in/" target="_blank" rel="noopener">RBI: press releases &amp; policy</a></li><li><a href="https://irdai.gov.in/" target="_blank" rel="noopener">IRDAI: insurance regulation news</a></li><li>The Hindu / Indian Express editorials</li><li>Monthly current-affairs magazines (any reputable one)</li></ul></div>
    <div class="card"><h3>Monthly checklist</h3>${CA_CATS.map(c => `<label style="display:flex;gap:8px;margin:5px 0"><input type="checkbox" data-c="cachk" data-k="${c}" ${S.checks['ca_' + c] ? 'checked' : ''}> ${c}</label>`).join('')}</div></div>
    <div class="card"><h3>My log (${S.ca.length})</h3>${Object.entries(by).map(([m, l]) => `<h3 style="margin-top:14px">${new Date(m + '-01T00:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3><ul class="clean">${l.map(c => `<li class="row between"><span><span class="pill">${esc(c.cat)}</span> <small class="mut">${c.date}</small><br>${esc(c.text)}</span><button class="btn sm d" data-a="caDel" data-id="${c.id}" aria-label="Delete">✕</button></li>`).join('')}</ul>`).join('') || '<p class="mut">Nothing logged yet.</p>'}</div>`;
  };
  A.actions.caAdd = () => { const text = document.getElementById('ca-t').value.trim(); if (!text) return; S.ca.push({ id: String(Date.now()), date: document.getElementById('ca-d').value || A.today(), cat: document.getElementById('ca-c').value, text }); A.save(); A.toast('Added ✓'); reload(); };
  A.actions.caDel = el => { S.ca = S.ca.filter(c => c.id !== el.dataset.id); A.save(); reload(); };
  A.changes.cachk = el => { S.checks['ca_' + el.dataset.k] = el.checked; A.save(); };

  /* ---------- Timer ---------- */
  V.timer = () => {
    const T = A.timer, t = A.today(), l = S.log[t] || {}, left = T.mode === 'idle' ? T.focus * 60 : A.timerLeft();
    const mmss = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    const pre = [[25, 5], [45, 10], [50, 10], [90, 15]];
    return `<h1>Focus timer</h1><div class="card" style="text-align:center"><small>${T.mode === 'idle' ? 'Ready' : T.mode === 'focus' ? 'Focus' : 'Break'}</small><div class="big" id="timerDisp" style="font-size:4rem">${mmss(left)}</div>
      <div class="chips" style="justify-content:center;margin:10px 0">${pre.map(([f, b]) => `<button class="chip ${T.focus === f ? 'on' : ''}" data-a="tpre" data-f="${f}" data-b="${b}">${f}/${b}</button>`).join('')}</div>
      <div class="row" style="justify-content:center">${T.mode === 'idle' ? '<button class="btn p" data-a="tstart">Start focus</button>' : '<button class="btn" data-a="tstop">Stop</button>'}<label><input type="checkbox" data-c="tloop" ${T.loop ? 'checked' : ''}> Auto-loop</label></div>
      <p class="mut">Completed focus sessions count toward your study time and streak. The timer keeps running while you browse other pages.</p></div>
      <div class="grid g2"><div class="card stat"><b>${l.timer || 0} min</b><span>focused today via timer</span></div><div class="card stat"><b>${T.sessions}</b><span>sessions this visit</span></div></div>
      <div class="card"><h3>Rules for a good session</h3><ul class="pts"><li>Phone in another room, notifications off.</li><li>One topic per session, with a clear goal written first.</li><li>During breaks: water, stretch, look far away. No social media.</li></ul></div>`;
  };
  A.actions.tpre = el => { if (A.timer.mode === 'idle') { A.timer.focus = +el.dataset.f; A.timer.brk = +el.dataset.b; } A.render(); };
  A.actions.tstart = () => { A.timerStart('focus'); A.render(); };
  A.actions.tstop = () => { A.timerStop(); A.render(); };
  A.changes.tloop = el => { A.timer.loop = el.checked; };

  /* ---------- Formula sheet ---------- */
  V.formulas = () => {
    const sq = Array.from({ length: 30 }, (_, i) => `<td>${i + 1}² = ${(i + 1) ** 2}</td>`), cu = Array.from({ length: 15 }, (_, i) => `<td>${i + 1}³ = ${(i + 1) ** 3}</td>`);
    const rows = (a, c) => Array.from({ length: Math.ceil(a.length / c) }, (_, r) => `<tr>${a.slice(r * c, r * c + c).join('')}</tr>`).join('');
    const fr = [['1/2', '50%'], ['1/3', '33.33%'], ['1/4', '25%'], ['1/5', '20%'], ['1/6', '16.67%'], ['1/7', '14.28%'], ['1/8', '12.5%'], ['1/9', '11.11%'], ['1/10', '10%'], ['1/11', '9.09%'], ['1/12', '8.33%'], ['1/15', '6.67%'], ['1/16', '6.25%'], ['1/20', '5%']];
    return `<div class="row between"><h1>Formula & fact sheet</h1><button class="btn" data-a="print">🖨️ Print</button></div>
    <div class="card"><h3>Speed-maths reference</h3><details open><summary>Squares 1–30</summary><table class="t">${rows(sq, 6)}</table></details><details><summary>Cubes 1–15</summary><table class="t">${rows(cu, 5)}</table></details><details open><summary>Fraction ↔ percentage</summary><table class="t">${rows(fr.map(f => `<td>${f[0]} = ${f[1]}</td>`), 4)}</table></details></div>
    ${Object.keys(SUBJ).map(k => `<div class="card"><h2>${A.subjTag(k)} ${SUBJ[k].name}</h2>${TOPICS.filter(t => t.s === k && t.f.length).map(t => `<details><summary>${esc(t.n)}</summary>${t.f.map(f => `<div class="formula">${esc(f)}</div>`).join('')}</details>`).join('')}</div>`).join('')}`;
  };
  A.actions.print = () => window.print();

  /* ---------- Exam guide ---------- */
  const CHECKLIST = [
    'Notification checked on licindia.in → Careers (recheck weekly)', 'Eligibility confirmed: age limit as on the cut-off date, graduation degree, citizenship', 'Active email ID and mobile number (all communication uses these)',
    'Passport-size photo, signature, left-thumb impression and handwritten declaration scanned per the notification specs', 'Graduation mark sheets / degree certificate ready', 'Photo ID (Aadhaar / PAN / Passport / Voter ID) ready for application and exam day',
    'Date-of-birth proof (10th certificate) ready', 'Category / PwBD / ex-serviceman certificates ready (if applicable)', 'Application fee paid and confirmation saved', 'Registration number and application PDF saved',
    'Exam city chosen and call letter downloaded when released', 'Original ID + call letter printout packed the day before',
  ];
  V.guide = () => `<h1>Exam guide</h1>
    <div class="notice"><b>Verify everything here against the official notification.</b> This page reflects the 2025 cycle and coaching-site summaries. The 2026 notification had not been published when this site was built, so pattern, dates, vacancies and negative marking may differ.</div>
    <div class="card"><h2>Exam at a glance</h2><table class="t"><tr><th>Stage</th><th>What it is</th><th>Notes</th></tr>
      <tr><td><b>Prelims</b></td><td>Online objective test: Reasoning (35), Quant (35), English (30). 100 questions, 60 minutes, 20 minutes per section.</td><td>Screening only. English is qualifying. Marks are not added to the final merit.</td></tr>
      <tr><td><b>Mains</b></td><td>Online objective papers (reasoning, quant/DI, GK &amp; current affairs, insurance &amp; financial market awareness, professional knowledge for specialists) plus a descriptive English paper (letter and essay).</td><td>Marks decide the rank. Sectional cut-offs apply. Descriptive is qualifying. English is qualifying.</td></tr>
      <tr><td><b>Interview</b></td><td>Personal interview.</td><td>Final merit combines mains and interview as notified.</td></tr>
      <tr><td><b>Medical</b></td><td>Pre-recruitment medical examination.</td><td>Mandatory for joining.</td></tr></table>
      <p class="mut">Sources disagree on negative marking for Generalist posts (one summary says none in prelims and mains, another says it generally applies). Use the Settings switch to practise either way, then follow the notification.</p></div>
    <div class="grid g2"><div class="card"><h2>Eligibility (2025 cycle)</h2><ul class="pts"><li>Age 21–30 as on the cut-off date for Generalist (Legal and CA posts allow up to 32); category relaxations apply.</li><li>Bachelor's degree in any discipline for AAO Generalist.</li><li>Indian citizen (see notification for other categories).</li><li>Specialist posts (CA, CS, Actuarial, Legal, IT, Insurance Specialist, Assistant Engineer) need post-specific qualifications.</li></ul></div>
    <div class="card"><h2>Pay &amp; career</h2><ul class="pts"><li>One coaching summary of the last notification lists a basic pay near ₹88,635 and about ₹1.26 lakh a month in an A-class city. Check the notification for the exact pay scale and allowances.</li><li>Generalists typically serve in mofussil branches for an initial period; read the posting clause in the notification.</li><li>Vacancies in 2025 were 841 overall (about 350 Generalist).</li></ul></div></div>
    <div class="card"><h2>Application &amp; exam-day checklist</h2>${CHECKLIST.map((c, i) => `<label style="display:flex;gap:10px;margin:8px 0"><input type="checkbox" data-c="chk" data-k="g${i}" ${S.checks['g' + i] ? 'checked' : ''}><span>${esc(c)}</span></label>`).join('')}</div>
    <div class="card"><h2>Exam strategy</h2><h3>Prelims (60 minutes, three 20-minute timers)</h3><ul class="pts"><li><b>Reasoning:</b> start with inequalities, syllogism, coding, blood relations (quick), then puzzles/seating. Skip a puzzle that is eating time.</li><li><b>Quant:</b> do simplification, series, quadratics and arithmetic first; leave long DI/caselet sets for last.</li><li><b>English:</b> you only need to clear the cut-off: error-spotting, cloze and vocabulary first, RC last.</li><li>Aim for high accuracy: the cut-off is usually sectional and you cannot return to a finished section.</li></ul>
      <h3>Mains</h3><ul class="pts"><li>Insurance &amp; financial awareness and GK are where preparation shows. Revise notes weekly.</li><li>Practise the descriptive paper under time; passing it is mandatory.</li><li>Use mains-style mocks to build stamina for the longer paper.</li></ul></div>
    <div class="card"><h2>Interview preparation</h2><p class="mut">Answer each question aloud in 45–60 seconds, in your own words. Record yourself once a week.</p><ol class="pts">${INTERVIEW_Q.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
      <p><b>Tips:</b> know your resume and graduation subjects well, read LIC's latest annual report highlights, be ready for the "work anywhere in India" question, and dress formally.</p></div>
    <div class="card"><h2>Official links</h2><ul class="clean">${OFFICIAL_LINKS.map(l => `<li><a href="${l.u}" target="_blank" rel="noopener">${esc(l.n)} ↗</a></li>`).join('')}</ul></div>
    <div class="card"><h2>How to use this site</h2><ol class="pts"><li><b>Today:</b> follow the time blocks, tick them off, add a check-in note.</li><li><b>Learn:</b> read topic notes, set status as you progress.</li><li><b>Practice:</b> topic questions with instant explanations. Wrong answers go to the Error Notebook.</li><li><b>Mocks:</b> weekly tests. Analyse every mistake.</li><li><b>Progress:</b> weak topics, streaks and score trends guide what to fix next.</li><li>Back up your progress from Settings regularly: data is stored only in this browser.</li></ol></div>`;
  A.changes.chk = el => { S.checks[el.dataset.k] = el.checked; A.save(); };

  /* ---------- Settings ---------- */
  V.settings = () => `<h1>Settings</h1>
    <div class="card"><h2>Plan</h2>
      <div class="grid g2"><div class="field"><label for="s-start">Day 1 date</label><input id="s-start" type="date" value="${S.start}"></div><div class="field"><label for="s-time">Daily start time</label><input id="s-time" type="time" value="${S.startTime}"></div>
      <div class="field"><label for="s-exam">Exam date (optional)</label><input id="s-exam" type="date" value="${S.exam}"></div>
      <div class="field"><label for="s-neg">Negative marking in mocks</label><select id="s-neg"><option value="0" ${+S.neg === 0 ? 'selected' : ''}>Off</option><option value="0.25" ${+S.neg === 0.25 ? 'selected' : ''}>0.25 per wrong</option><option value="0.33" ${+S.neg === 0.33 ? 'selected' : ''}>0.33 per wrong</option></select></div></div>
      <div class="field"><label for="s-theme">Theme</label><select id="s-theme"><option value="auto" ${S.theme === 'auto' ? 'selected' : ''}>Match device</option><option value="light" ${S.theme === 'light' ? 'selected' : ''}>Light</option><option value="dark" ${S.theme === 'dark' ? 'selected' : ''}>Dark</option></select></div>
      <button class="btn p" data-a="saveSettings">Save settings</button></div>
    <div class="card"><h2>Missed days? Shift the plan</h2><p class="mut">Don't cram. Move the schedule so today shows the next unfinished day.</p><div class="row"><button class="btn" data-a="shift" data-d="1">Take a rest day (shift +1)</button><button class="btn" data-a="shift" data-d="2">Shift +2 days</button><button class="btn" data-a="shift" data-d="7">Shift +1 week</button></div>
      <div class="row" style="margin-top:10px"><label for="s-jump">Jump to day</label><input id="s-jump" type="number" min="1" max="${TOTAL_DAYS}" style="width:100px" placeholder="1–${TOTAL_DAYS}"><button class="btn" data-a="jump">Make today this day</button></div></div>
    <div class="card"><h2>Your data</h2><p class="mut">Everything is stored in this browser only. Export a backup regularly, and use it to move to another device.${A.storageOk() ? '' : ' <b>Storage is blocked in this browser, so progress will not be saved.</b>'}</p>
      <div class="row"><button class="btn" data-a="export">⬇️ Export backup</button><label class="btn">⬆️ Import backup<input type="file" accept="application/json" data-c="import" hidden></label><button class="btn d" data-a="reset">Reset everything</button></div></div>
    <div class="card"><h2>About</h2><p class="mut">LIC AAO Prep Studio is a free, open study tool. It is not affiliated with or endorsed by LIC. Exam information may be out of date, so always rely on the official notification.</p></div>`;
  A.actions.saveSettings = () => {
    S.start = document.getElementById('s-start').value || S.start; S.startTime = document.getElementById('s-time').value || '19:00'; S.exam = document.getElementById('s-exam').value;
    S.neg = +document.getElementById('s-neg').value; S.theme = document.getElementById('s-theme').value; A.applyTheme(); A.save(); A.toast('Settings saved ✓'); A.render();
  };
  A.actions.shift = el => { S.start = A.addDays(S.start, +el.dataset.d); A.save(); A.toast('Plan shifted. Today now shows Day ' + Math.max(1, A.dayNo())); A.render(); };
  A.actions.jump = () => { const n = +document.getElementById('s-jump').value; if (n < 1 || n > TOTAL_DAYS) { A.toast('Enter a day from 1 to ' + TOTAL_DAYS); return; } S.start = A.addDays(A.today(), -(n - 1)); A.save(); A.toast('Today is now Day ' + n); A.render(); };
  A.actions.export = () => { A.download('aao-prep-backup-' + A.today() + '.json', JSON.stringify(S, null, 1), 'application/json'); };
  A.changes.import = el => {
    const f = el.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { try { const d = JSON.parse(r.result); if (typeof d !== 'object' || !d.v) throw 0; Object.keys(S).forEach(k => delete S[k]); Object.assign(S, d); A.save(); A.applyTheme(); A.toast('Backup restored ✓'); A.render(); } catch (e) { A.toast('That file is not a valid backup.'); } };
    r.readAsText(f);
  };
  A.actions.reset = () => { if (confirm('Delete ALL progress, notes and settings from this browser? This cannot be undone.')) { try { localStorage.removeItem('aao_prep_v1'); } catch (e) { } location.hash = '#/'; location.reload(); } };
})();
