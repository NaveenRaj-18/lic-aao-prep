/* Generates the 168-day (24-week) study plan. Day 1 = start day. Weekly rhythm:
   D1 Quant · D2 Reasoning · D3 English · D4 Quant · D5 Reasoning · D6 GK/Insurance · D7 Test & Review */
const TOTAL_DAYS = 168;

function mkBlock(id, label, mins, desc, link) { return { id, label, mins, desc: desc || '', link: link || '' }; }

const WARM = {
  QA: 'Mental-math drill: tables, squares, fraction↔% (no calculator)',
  RE: 'Warm-up: 10 quick series / coding questions',
  EN: 'Warm-up: read one editorial paragraph aloud, underline new words',
  GK: 'Recap: recall yesterday\'s 5 facts without looking',
  INS: 'Recap: recall yesterday\'s 5 facts without looking',
};

function buildQueues() {
  const by = s => TOPICS.filter(t => t.s === s);
  const two = list => list.flatMap(t => [{ t: t.id, k: 'learn' }, { t: t.id, k: 'practice' }]);
  const gk = by('GK'), ins = by('INS'), gkins = [];
  const order = ['i_basics', 'g_ca', 'i_life', 'g_polity', 'i_lic', 'g_econ', 'i_irdai', 'g_hist', 'i_gen', 'g_awards', 'i_bank', 'g_sci', 'i_cap', 'i_sch'];
  order.forEach(id => gkins.push({ t: id, k: 'learn' }));
  return { QA: two(by('QA')), RE: two(by('RE')), EN: two(by('EN')), GKINS: gkins };
}

function buildPlan() {
  const q = buildQueues(), ptr = { QA: 0, RE: 0, EN: 0, GKINS: 0 };
  const revisedPool = { QA: [], RE: [], EN: [], GKINS: [] };
  const days = [];
  for (let n = 1; n <= TOTAL_DAYS; n++) {
    const week = Math.ceil(n / 7), dow = ((n - 1) % 7) + 1;
    const phase = n <= 56 ? 1 : n <= 126 ? 2 : 3;
    let d = { n, week, dow, phase, goal: WEEK_GOALS[week - 1] };
    if (phase < 3) {
      if (dow === 7) d = Object.assign(d, testDay(week, phase));
      else {
        const key = { 1: 'QA', 2: 'RE', 3: 'EN', 4: 'QA', 5: 'RE', 6: 'GKINS' }[dow];
        let item = q[key][ptr[key]];
        if (item) { ptr[key]++; revisedPool[key].push(item.t); }
        else {
          const pool = revisedPool[key]; const t = pool[(n * 7) % pool.length];
          item = { t, k: 'revise' };
        }
        d = Object.assign(d, studyDay(item, key));
      }
    } else {
      d = Object.assign(d, finalPhaseDay(n, dow, week));
    }
    days.push(d);
  }
  return days;
}

function dailyBlock() { return mkBlock('daily', 'Daily 10: current affairs + 5 vocab words', 10, 'Read 5 headlines (see Current Affairs log) and review vocab flashcards.', '#/vocab'); }

function studyDay(item, key) {
  const t = TOPIC_BY_ID[item.t], subj = t.s;
  const base = { subj, topic: t.id, kind: item.k };
  if (item.k === 'learn') {
    return Object.assign(base, {
      title: `${t.n}: Learn`,
      blocks: [
        mkBlock('warm', 'Warm-up', 10, WARM[subj]),
        mkBlock('learn', `Study: ${t.n}`, 35, 'Read the notes, write your formula sheet, solve the 5 examples.', '#/topic/' + t.id),
        mkBlock('prac', 'Practice 15–20 questions', 30, 'Untimed first, then timed.', '#/practice?topic=' + t.id),
        mkBlock('err', 'Log mistakes in the Error Notebook', 5, 'Write why you got it wrong, not just the answer.', '#/errors'),
        dailyBlock()],
    });
  }
  if (item.k === 'practice') {
    return Object.assign(base, {
      title: `${t.n}: Practice`,
      blocks: [
        mkBlock('warm', 'Warm-up', 10, WARM[subj]),
        mkBlock('rev', 'Revise concepts & formulas', 10, 'Re-read your formula sheet.', '#/topic/' + t.id),
        mkBlock('prac', 'Timed practice set', 40, `Target: ${t.tg}.`, '#/practice?topic=' + t.id + '&n=25'),
        mkBlock('err', 'Analyse mistakes', 20, 'Redo every wrong question without looking at the solution.', '#/errors'),
        dailyBlock()],
    });
  }
  return Object.assign(base, {
    title: `Revision: ${t.n}`,
    blocks: [
      mkBlock('warm', 'Warm-up', 10, WARM[subj]),
      mkBlock('rev', 'Revise old notes', 20, 'Skim the topic notes and formula sheet.', '#/topic/' + t.id),
      mkBlock('prac', 'Timed mixed set', 40, 'Mixed questions from the whole subject.', '#/practice?subj=' + subj + '&n=25'),
      mkBlock('err', 'Error Notebook revision', 10, 'Retry old mistakes.', '#/errors'),
      dailyBlock()],
  });
}

function testDay(week, phase) {
  const writing = week % 2 === 0;
  if (phase === 1) {
    return {
      subj: 'ALL', kind: 'test', title: `Week ${week}: Sectional test & review`,
      blocks: [
        mkBlock('test', 'Sectional test (Reasoning + Quant)', 40, 'Questions from topics you studied this week.', '#/mock?type=sectional'),
        mkBlock('ana', 'Analyse every mistake', 30, 'Which topic? Logic, calculation, or time?', '#/errors'),
        mkBlock('weak', 'Revise the weakest topic', 25, 'Check Progress → weak topics.', '#/progress'),
        mkBlock('plan', 'Weekly review & plan next week', 10, 'Fill in the check-in note.', ''),
        mkBlock('ca', 'Weekly current-affairs summary', 15, 'Write a one-page summary of the week.', '#/ca')],
    };
  }
  return {
    subj: 'ALL', kind: 'mock', title: `Week ${week}: Full prelims mock & analysis`,
    blocks: [
      mkBlock('mock', 'Full Prelims mock (60 min)', 60, 'RE 35 · QA 35 · EN 30, with 20-minute sectional timers.', '#/mock?type=prelims'),
      mkBlock('ana', 'Mock analysis', 40, 'Classify mistakes: concept, calculation, silly, time.', '#/errors'),
      writing ? mkBlock('write', 'Descriptive writing: letter + essay', 30, 'Write under time, then self-review.', '#/write')
              : mkBlock('weak', 'Fix the weakest topic', 30, 'Pick a weak topic from Progress.', '#/progress'),
      mkBlock('ca', 'Weekly current-affairs summary', 15, 'One-page summary.', '#/ca')],
  };
}

function finalPhaseDay(n, dow, week) {
  if (n >= 166) {
    return { subj: 'ALL', kind: 'final', title: n === 168 ? 'Final day: rest and exam-day plan' : 'Light revision and rest', blocks: [
      mkBlock('rev', 'Revise formula sheet & short notes', 30, 'No new topics.', '#/formulas'),
      mkBlock('err', 'Skim the Error Notebook', 20, 'Only the repeated mistakes.', '#/errors'),
      mkBlock('plan', n === 168 ? 'Pack documents, plan travel, sleep early' : 'Check admit card, centre location, ID', 20, 'Read the Exam Guide checklist.', '#/guide'),
      mkBlock('rest', 'Rest / walk / light exercise', 20, 'Protect your sleep.', '')] };
  }
  const pattern = {
    1: { title: 'Full Prelims mock', blocks: [mkBlock('mock', 'Full Prelims mock (60 min)', 60, 'RE 35 · QA 35 · EN 30', '#/mock?type=prelims'), mkBlock('ana', 'Analyse the mock', 45, 'Identify 3 recurring issues.', '#/errors'), dailyBlock()], subj: 'ALL', kind: 'mock' },
    2: { title: 'Weak-topic repair', blocks: [mkBlock('weak', 'Weak topics from Progress', 40, 'Study notes + practice.', '#/progress'), mkBlock('prac', 'Timed practice', 30, 'Topic practice until 85%.', '#/practice'), mkBlock('err', 'Error Notebook revision', 10, '', '#/errors'), dailyBlock()], subj: 'ALL', kind: 'revise' },
    3: { title: 'Mains-style practice mock', blocks: [mkBlock('mock', 'Mains-style objective mock', 60, 'RE · QA · GK · Insurance (practice format).', '#/mock?type=mains'), mkBlock('ana', 'Analysis', 30, '', '#/errors'), dailyBlock()], subj: 'ALL', kind: 'mock' },
    4: { title: 'Quant + DI speed day', blocks: [mkBlock('warm', 'Speed-maths drill', 10, WARM.QA), mkBlock('prac', 'Timed Quant sets', 45, '', '#/practice?subj=QA&n=35'), mkBlock('di', 'Data Interpretation set', 20, '', '#/practice?topic=q_di&n=10'), dailyBlock()], subj: 'QA', kind: 'revise' },
    5: { title: 'Reasoning puzzles & seating day', blocks: [mkBlock('warm', 'Warm-up', 10, WARM.RE), mkBlock('prac', 'Timed Reasoning sets', 45, '', '#/practice?subj=RE&n=35'), mkBlock('puz', 'Puzzle set', 20, '', '#/practice?topic=r_puz&n=10'), dailyBlock()], subj: 'RE', kind: 'revise' },
    6: { title: 'GK + Insurance + Interview prep', blocks: [mkBlock('ca', 'Revise a month of current affairs', 30, '', '#/ca'), mkBlock('ins', 'Insurance & finance quiz', 25, '', '#/practice?subj=INS&n=30'), mkBlock('int', 'Practise 5 interview questions aloud', 25, '', '#/guide'), dailyBlock()], subj: 'ALL', kind: 'revise' },
    7: { title: 'Full Prelims mock + writing', blocks: [mkBlock('mock', 'Full Prelims mock (60 min)', 60, '', '#/mock?type=prelims'), mkBlock('ana', 'Analysis', 40, '', '#/errors'), mkBlock('write', 'Descriptive writing', 30, '', '#/write'), mkBlock('ca', 'Weekly CA summary', 10, '', '#/ca')], subj: 'ALL', kind: 'mock' },
  }[dow];
  return pattern;
}

const PLAN = buildPlan();
PLAN.forEach(d => { d.total = d.blocks.reduce((a, b) => a + b.mins, 0); });
