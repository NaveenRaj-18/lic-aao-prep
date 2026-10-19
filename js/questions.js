/* Question bank: hand-written static questions + generators that create unlimited fresh practice questions.
   Treat this as a practice starter. Supplement with official previous-year papers and mock tests. */
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const fact = n => n <= 1 ? 1 : n * fact(n - 1);
const nCr = (n, r) => fact(n) / (fact(r) * fact(n - r));
const trim = v => String(+(+v).toFixed(2));
const hashStr = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return 'q' + (h >>> 0).toString(36); };
const ratioStr = (a, b) => { const g = gcd(a, b); return `${a / g}:${b / g}`; };
const fracStr = (n, d) => { const g = gcd(n, d); return `${n / g}/${d / g}`; };

/* Build numeric question with plausible distractors. */
function numQ(t, q, ans, e, o = {}) {
  const { unit = '', pre = '', dec = 2, p } = o;
  const set = new Set([+(+ans).toFixed(dec)]);
  let tries = 0;
  while (set.size < 4 && tries++ < 80) {
    const mag = Math.max(1, Math.round(Math.abs(ans) * pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3])));
    let v = +(+ans + pick([-1, 1]) * mag * rnd(1, 2)).toFixed(dec);
    if (v !== ans && (ans < 0 || v > 0)) set.add(v);
  }
  let k = 1; while (set.size < 4) { set.add(+(+ans + k).toFixed(dec)); k++; }
  const vals = shuffle([...set]);
  return { t, q, p, o: vals.map(v => `${pre}${trim(v)}${unit}`), a: vals.indexOf(+(+ans).toFixed(dec)), e };
}
function strQ(t, q, correct, pool, e, p) {
  const set = new Set([correct]);
  shuffle(pool).forEach(x => { if (set.size < 4 && x !== correct) set.add(x); });
  let guardPad = 0;
  while (set.size < 4 && guardPad++ < 50) {
    if (String(correct).includes(':')) set.add(`${rnd(1, 9)}:${rnd(1, 9)}`);
    else if (String(correct).includes('/')) set.add(fracStr(rnd(1, 12), 36));
    else set.add(String(correct) + ' ' + guardPad);
  }
  const vals = shuffle([...set]);
  return { t, q, p, o: vals, a: vals.indexOf(correct), e };
}

/* ---------- Static questions: [topic, question, options[], answerIndex, explanation, passage?] ---------- */
const STATIC = [];
const S = (t, q, o, a, e, p) => STATIC.push({ t, q, o, a, e: e || '', p });

/* Insurance & finance */
S('i_lic', 'Life Insurance Corporation of India (LIC) was established in which year?', ['1947', '1956', '1969', '1991'], 1, 'Life insurance was nationalised and LIC was formed on 1 September 1956 under the LIC Act, 1956.');
S('i_lic', 'Where is the headquarters of LIC?', ['New Delhi', 'Kolkata', 'Mumbai', 'Chennai'], 2, 'LIC\'s headquarters (Yogakshema Building) is in Mumbai.');
S('i_lic', 'LIC\'s motto "Yogakshemam Vahamyaham" broadly means:', ['Safety first', 'Your welfare is our responsibility', 'Insurance for all', 'Trust and growth'], 1, 'It is from the Bhagavad Gita and is understood as "your welfare is our responsibility".');
S('i_lic', 'LIC was listed on the Indian stock exchanges through an IPO in:', ['2019', '2020', '2022', '2024'], 2, 'LIC\'s IPO opened in May 2022.');
S('i_irdai', 'Where is the headquarters of IRDAI?', ['Mumbai', 'Hyderabad', 'Bengaluru', 'New Delhi'], 1, 'IRDAI is headquartered in Hyderabad.');
S('i_irdai', 'IRDAI was established under which Act?', ['Insurance Act, 1938', 'IRDA Act, 1999', 'LIC Act, 1956', 'RBI Act, 1934'], 1, 'The IRDA Act, 1999 created the regulator.');
S('i_irdai', 'The Insurance Act, which governs the sector, was passed in:', ['1938', '1956', '1999', '2015'], 0, 'The Insurance Act, 1938 is the principal legislation.');
S('i_irdai', 'The Insurance Ombudsman can handle complaints for claims up to:', ['₹5 lakh', '₹10 lakh', '₹30 lakh', '₹1 crore'], 2, 'Under the Insurance Ombudsman Rules, 2017 the limit is ₹30 lakh.');
S('i_basics', 'The principle requiring full and honest disclosure of material facts is:', ['Indemnity', 'Utmost good faith', 'Subrogation', 'Contribution'], 1, 'Uberrimae fidei, utmost good faith.');
S('i_basics', 'Insurable interest in a life insurance policy must be present:', ['At the time of claim only', 'At the time of taking the policy', 'At maturity only', 'Never required'], 1, 'For life insurance it must exist at inception.');
S('i_basics', 'The principle of indemnity does NOT apply to:', ['Fire insurance', 'Motor insurance', 'Life insurance', 'Marine insurance'], 2, 'Life insurance is a contract of assurance, not indemnity, as human life cannot be valued exactly.');
S('i_basics', 'When an insurer passes part of its risk to another insurer, it is called:', ['Underwriting', 'Reinsurance', 'Subrogation', 'Surrender'], 1, 'Reinsurance spreads large risks.');
S('i_basics', 'The process of evaluating a risk and deciding the premium is called:', ['Underwriting', 'Surrender', 'Annuity', 'Lapse'], 0, 'Underwriting.');
S('i_basics', 'The periodic amount paid to the insurer for cover is called:', ['Premium', 'Sum assured', 'Bonus', 'Claim'], 0, 'Premium.');
S('i_life', 'Which life insurance plan offers pure protection with no maturity benefit?', ['Endowment', 'Term insurance', 'Money-back', 'ULIP'], 1, 'Term plans provide only a death benefit and are the cheapest per unit of cover.');
S('i_life', 'A plan that combines insurance with market-linked investment is:', ['Term plan', 'ULIP', 'Whole life', 'Annuity'], 1, 'Unit Linked Insurance Plan.');
S('i_life', 'The lock-in period for a ULIP is:', ['1 year', '3 years', '5 years', '10 years'], 2, 'ULIPs have a 5-year lock-in.');
S('i_life', 'A plan that pays regular income after retirement is:', ['Term plan', 'Annuity plan', 'Endowment plan', 'Money-back plan'], 1, 'Annuity / pension plan.');
S('i_life', 'The person who receives policy proceeds on the policyholder\'s death is the:', ['Agent', 'Nominee', 'Underwriter', 'Surveyor'], 1, 'Nominee (or beneficiary).');
S('i_life', 'The amount payable when a policyholder voluntarily terminates a policy early is the:', ['Maturity value', 'Surrender value', 'Sum assured', 'Bonus'], 1, 'Surrender value.');
S('i_life', 'The "free look period" allows a policyholder to:', ['Pay premium late', 'Cancel the policy after receiving it and get a refund (minus permitted charges)', 'Change the nominee for free', 'Increase the sum assured'], 1, 'It is the window after receiving the policy during which it can be cancelled.');
S('i_gen', 'Which insurance is mandatory under the Motor Vehicles Act?', ['Comprehensive cover', 'Third-party liability', 'Zero-depreciation cover', 'Personal accident add-on'], 1, 'Third-party liability cover is mandatory.');
S('i_gen', 'A health policy reimbursing hospitalisation expenses is commonly called:', ['Mediclaim', 'Endowment', 'Annuity', 'ULIP'], 0, 'Mediclaim.');
S('i_gen', 'The "waiting period" in health insurance is:', ['Time to get the policy issued', 'Period before certain claims become payable', 'Time in hospital', 'Time taken to settle the claim'], 1, 'Claims for certain conditions are not payable until it ends.');
S('i_sch', 'The life cover under PMJJBY is:', ['₹1 lakh', '₹2 lakh', '₹5 lakh', '₹10 lakh'], 1, 'Pradhan Mantri Jeevan Jyoti Bima Yojana offers ₹2 lakh cover.');
S('i_sch', 'The annual premium under PMSBY is:', ['₹12', '₹20', '₹100', '₹436'], 1, 'PMSBY premium is ₹20 per year; ₹436 is PMJJBY.');
S('i_sch', 'Atal Pension Yojana is open to subscribers aged:', ['18–40', '21–60', '25–45', '18–65'], 0, 'APY is for ages 18–40.');
S('i_sch', 'Pradhan Mantri Jan Dhan Yojana was launched in:', ['2010', '2014', '2016', '2019'], 1, 'Launched on 28 August 2014.');
S('i_sch', 'Ayushman Bharat PM-JAY gives cover per family per year of up to:', ['₹1 lakh', '₹3 lakh', '₹5 lakh', '₹10 lakh'], 2, '₹5 lakh per family per year.');
S('i_bank', 'The Reserve Bank of India was established in:', ['1935', '1947', '1949', '1969'], 0, 'On 1 April 1935.');
S('i_bank', 'The rate at which the RBI lends short-term funds to banks against securities is the:', ['Reverse repo rate', 'Repo rate', 'Bank rate', 'CRR'], 1, 'Repo rate.');
S('i_bank', 'CRR stands for the cash reserve that banks must hold:', ['In their own vaults', 'With the RBI as a % of NDTL', 'In government securities', 'In gold'], 1, 'Cash Reserve Ratio is kept with RBI as a percentage of Net Demand and Time Liabilities.');
S('i_bank', 'The Monetary Policy Committee of the RBI has how many members?', ['4', '5', '6', '9'], 2, 'Six members: three from RBI and three appointed by the government.');
S('i_bank', 'India\'s flexible inflation target is:', ['2% ± 2%', '4% ± 2%', '6% ± 2%', '5% ± 1%'], 1, 'The target is 4% with a tolerance band of ±2%.');
S('i_bank', 'UPI is developed by:', ['RBI', 'NPCI', 'SEBI', 'NABARD'], 1, 'National Payments Corporation of India.');
S('i_bank', 'NABARD primarily supports:', ['Stock markets', 'Agriculture and rural development', 'Insurance', 'Foreign trade'], 1, 'NABARD was set up in 1982.');
S('i_cap', 'SEBI regulates:', ['Banks', 'Insurance companies', 'Securities markets', 'Pension funds only'], 2, 'SEBI is the securities-market regulator.');
S('i_cap', 'NAV of a mutual fund stands for:', ['Net Asset Value', 'National Asset Value', 'Net Annual Value', 'New Allotment Value'], 0, 'Net Asset Value per unit.');
S('i_cap', 'SIP stands for:', ['Systematic Investment Plan', 'Secured Income Plan', 'Single Insurance Premium', 'Savings Interest Plan'], 0, 'Systematic Investment Plan.');
/* GK */
S('g_econ', 'GST was implemented in India on:', ['1 April 2016', '1 July 2017', '1 January 2018', '26 January 2017'], 1, 'GST was launched on 1 July 2017.');
S('g_econ', 'Which of the following is NOT a direct tax?', ['Income tax', 'Corporate tax', 'GST', 'Wealth-type levies on individuals'], 2, 'GST is an indirect tax.');
S('g_econ', 'Fiscal deficit equals:', ['Revenue expenditure − revenue receipts', 'Total expenditure − total receipts (excluding borrowings)', 'Imports − exports', 'Tax − non-tax revenue'], 1, 'It is the gap financed by borrowing.');
S('g_polity', 'Article 21 of the Constitution deals with:', ['Equality before law', 'Right to life and personal liberty', 'Freedom of speech', 'Right to constitutional remedies'], 1, 'Article 21 protects life and personal liberty.');
S('g_polity', 'The Union Budget is presented under which Article?', ['Article 110', 'Article 112', 'Article 148', 'Article 280'], 1, 'Article 112 requires the annual financial statement.');
S('g_polity', 'The Constitution of India came into force on:', ['15 August 1947', '26 November 1949', '26 January 1950', '2 October 1950'], 2, 'Adopted 26 Nov 1949, effective 26 Jan 1950.');
S('g_polity', 'The maximum strength of the Rajya Sabha is:', ['245', '250', '252', '545'], 1, 'The Constitution provides for a maximum of 250 members.');
S('g_hist', 'The Battle of Plassey was fought in:', ['1757', '1764', '1857', '1919'], 0, '1757.');
S('g_hist', 'The Quit India Movement was launched in:', ['1930', '1942', '1946', '1919'], 1, 'August 1942.');
S('g_hist', 'The Tropic of Cancer passes through how many Indian states?', ['6', '7', '8', '9'], 2, 'Eight states, from Gujarat to Mizoram.');
S('g_awards', 'International Yoga Day is observed on:', ['21 June', '5 June', '22 April', '1 May'], 0, '21 June.');
S('g_awards', 'World Environment Day is observed on:', ['22 March', '22 April', '5 June', '16 September'], 2, '5 June.');
S('g_sci', 'The chemical symbol of gold is:', ['Ag', 'Au', 'Gd', 'Go'], 1, 'Au from Latin aurum.');

/* Reasoning */
S('r_blood', 'Pointing to a man, Riya said, "He is the son of my mother\'s only brother." How is the man related to Riya?', ['Brother', 'Cousin', 'Nephew', 'Uncle'], 1, 'Mother\'s brother = maternal uncle; his son = cousin.');
S('r_blood', 'A is B\'s sister. C is B\'s mother. D is C\'s father. How is A related to D?', ['Grandmother', 'Daughter', 'Granddaughter', 'Aunt'], 2, 'A is C\'s daughter, D is C\'s father, so A is D\'s granddaughter.');
S('r_blood', 'Pointing to a photograph, a man said, "I have no brother or sister, but that man\'s father is my father\'s son." Whose photograph is it?', ['His own', 'His son', 'His father', 'His nephew'], 1, 'My father\'s son (with no siblings) is me, so that man\'s father is me.');
S('r_blood', 'P is the brother of Q, Q is the sister of R, and R is the father of S. How is P related to S?', ['Father', 'Uncle', 'Brother', 'Cousin'], 1, 'P is R\'s brother, and R is S\'s father, so P is S\'s uncle.');
S('r_dir', 'A man walks 5 km North, turns right and walks 3 km, then turns right again and walks 5 km. How far and in which direction is he from the start?', ['3 km East', '3 km West', '5 km East', '8 km East'], 0, 'N5 → E3 → S5; the net displacement is 3 km East.');
S('r_dir', 'Facing North, Ravi turns 90° clockwise and then 180° anticlockwise. Which direction is he facing now?', ['East', 'West', 'North', 'South'], 1, 'North → East → West.');
S('r_dir', 'In the morning, the shadow of a pole falls towards the:', ['East', 'West', 'North', 'South'], 1, 'The sun is in the East, so the shadow points West.');
S('r_rank', 'Meera is 7th from the left and 12th from the right in a row. How many people are in the row?', ['18', '19', '20', '17'], 0, '7 + 12 − 1 = 18.');
S('r_syl', 'Statements: All pens are books. All books are tables. Conclusions: I. All pens are tables. II. Some tables are books.', ['Only I', 'Only II', 'Both follow', 'Neither follows'], 2, 'I follows by transitivity. II follows by conversion of "All books are tables".');
S('r_syl', 'Statements: Some cats are dogs. All dogs are birds. Conclusions: I. Some cats are birds. II. All cats are birds.', ['Only I', 'Only II', 'Both follow', 'Neither follows'], 0, 'Some cats are dogs and all dogs are birds ⇒ some cats are birds. "All cats" is not guaranteed.');
S('r_syl', 'Statements: No fruit is a vegetable. Some vegetables are leaves. Conclusions: I. Some leaves are not fruits. II. No leaf is a fruit.', ['Only I', 'Only II', 'Both follow', 'Neither follows'], 0, 'Some leaves are vegetables, which are not fruits, so some leaves are not fruits. II is too strong.');
S('r_ineq', 'Statement: P > Q ≥ R = S. Conclusions: I. P > S  II. R ≤ Q', ['Only I', 'Only II', 'Both follow', 'Neither follows'], 2, 'P > Q ≥ R = S gives P > S; and Q ≥ R means R ≤ Q.');
S('r_ineq', 'Statement: A ≥ B > C ≤ D. Conclusions: I. A > C  II. B ≥ D', ['Only I', 'Only II', 'Both follow', 'Neither follows'], 0, 'A ≥ B > C gives A > C. B and D have no fixed relation.');
S('r_ineq', 'Statement: M < N ≤ O = P. Conclusions: I. M < P  II. N < P', ['Only I', 'Only II', 'Both follow', 'Neither follows'], 0, 'M < N ≤ P so M < P. But N ≤ P does not give N < P.');
S('r_ser', 'If CAT is coded as DBU, how is DOG coded?', ['EPH', 'EQH', 'FPH', 'CNF'], 0, 'Each letter is moved one step forward.');
S('r_ser', 'If TABLE is written as UBCMF, how is CHAIR written?', ['DIBJS', 'DIBJR', 'BGZHQ', 'DJBIS'], 0, 'Each letter +1.');
S('r_ser', 'In a code, "sky is blue" = "ab cd ef", "blue sea deep" = "ef gh ij", "sea is vast" = "gh cd kl". What is the code for "sky"?', ['ab', 'cd', 'ef', 'gh'], 0, '"blue" = ef and "is" = cd, so "sky" = ab.');
S('r_ser', 'Which letter is 5th to the right of the 10th letter from the left in the English alphabet?', ['N', 'O', 'P', 'Q'], 1, '10th is J; 5 further is O.');
S('r_ser', 'What is the mirror (opposite) letter of G in the alphabet?', ['S', 'T', 'U', 'F'], 1, '27 − 7 = 20, the letter T.');
S('r_misc', 'Odd one out: Apple, Mango, Potato, Banana', ['Apple', 'Mango', 'Potato', 'Banana'], 2, 'Potato is a vegetable; the others are fruits.');
S('r_misc', 'Odd one out: 16, 25, 36, 48', ['16', '25', '36', '48'], 3, '48 is not a perfect square.');
S('r_misc', 'Doctor : Hospital :: Teacher : ?', ['Student', 'School', 'Book', 'Class'], 1, 'Worker : workplace.');
S('r_misc', 'Book : Reading :: Fork : ?', ['Eating', 'Cooking', 'Kitchen', 'Spoon'], 0, 'Tool : its use.');
S('r_lin', 'Five friends A–E sit in a row facing north. B is immediately right of A. C is at the extreme left. D is between B and E. Who sits in the middle?', ['A', 'B', 'D', 'E'], 1, 'Order: C A B D E.');
S('r_circ', 'Eight equally spaced people sit around a circle. How many people sit between A and the person opposite to A?', ['3', '4', '5', '2'], 0, 'Opposite is 4 positions away; 3 people lie between.');
S('r_ds', 'What is the value of x? I. x + 2 = 5.  II. x² = 9.', ['I alone is sufficient', 'II alone is sufficient', 'Both are needed', 'Neither is sufficient'], 0, 'I gives x = 3. II gives x = ±3.');
S('r_puz', 'Five people P, Q, R, S, T live on five floors (1 to 5). P lives on floor 1. Q lives immediately above P. T lives above S, and R lives on floor 5. Who lives on floor 4?', ['S', 'T', 'Q', 'R'], 1, 'Floors: P1, Q2, S3, T4, R5.');

/* English */
S('e_err', 'Find the part with an error.', ['The number of students', 'who have enrolled for the course', 'are increasing every year.', 'No error'], 2, '"The number of" takes a singular verb: "is increasing".');
S('e_err', 'Find the part with an error.', ['Each of the employees', 'have submitted', 'their reports on time.', 'No error'], 1, '"Each" is singular: "has submitted".');
S('e_err', 'Find the part with an error.', ['She is senior', 'than me', 'by two years.', 'No error'], 1, '"Senior" takes "to": "senior to me".');
S('e_err', 'Find the part with an error.', ['He did not', 'said anything', 'about the matter.', 'No error'], 1, 'After "did not" use the base form: "say".');
S('e_err', 'Find the part with an error.', ['Neither the manager', 'nor the employees was aware', 'of the new policy.', 'No error'], 1, 'The verb agrees with the nearer subject (employees): "were aware".');
S('e_err', 'Find the part with an error.', ['The committee has', 'submitted its report', 'to the chairman.', 'No error'], 3, 'The sentence is correct.');
S('e_err', 'Find the part with an error.', ['I have been working here', 'since five years.', 'No error'], 1, 'Use "for" with a period of time: "for five years".');
S('e_gram', 'If I ___ you, I would accept the offer.', ['was', 'were', 'am', 'be'], 1, 'The subjunctive in unreal conditions uses "were".');
S('e_gram', 'She has been living in Chennai ___ 2015.', ['for', 'since', 'from', 'at'], 1, '"Since" is used with a point in time.');
S('e_gram', 'He is good ___ mathematics.', ['in', 'at', 'on', 'with'], 1, '"Good at".');
S('e_gram', 'The news ___ true.', ['are', 'were', 'is', 'have been'], 2, '"News" is uncountable and singular.');
S('e_gram', 'I prefer tea ___ coffee.', ['than', 'to', 'over than', 'from'], 1, '"Prefer X to Y".');
S('e_gram', 'Hardly had he reached the station ___ the train left.', ['than', 'when', 'then', 'as'], 1, '"Hardly … when".');
S('e_gram', 'One of my friends ___ a doctor.', ['are', 'is', 'were', 'have'], 1, '"One of" takes a singular verb.');
S('e_cloze', 'The government has ___ a new scheme to promote rural insurance.', ['launched', 'lunched', 'launching', 'launch'], 0, 'Present perfect: "has launched".');
S('e_cloze', 'Despite the heavy rain, the match went ___ as scheduled.', ['on', 'ahead', 'off', 'by'], 1, '"Went ahead" means proceeded.');
S('e_cloze', 'The company decided to ___ the old policy and introduce a new one.', ['scrap', 'scrape', 'scrub', 'scribe'], 0, '"Scrap" means to discard.');
S('e_vocab', 'Idiom: "A blessing in disguise" means:', ['An apparent misfortune that turns out well', 'A hidden danger', 'A religious ceremony', 'A lucky guess'], 0, 'A good thing that seemed bad at first.');
S('e_vocab', 'Idiom: "Once in a blue moon" means:', ['Very rarely', 'Every month', 'At night', 'Very often'], 0, 'Extremely rarely.');
S('e_vocab', 'Idiom: "To bite the bullet" means:', ['To eat quickly', 'To face a difficult situation bravely', 'To be afraid', 'To refuse help'], 1, 'Facing something unpleasant with courage.');
S('e_vocab', 'Idiom: "Break the ice" means:', ['To start a conversation in an awkward situation', 'To destroy something', 'To cool down', 'To end a relationship'], 0, 'To ease tension at the start.');
S('e_vocab', 'Idiom: "Cost an arm and a leg" means:', ['To be very expensive', 'To cause injury', 'To be cheap', 'To be free'], 0, 'Very expensive.');
S('e_vocab', 'Idiom: "Hit the nail on the head" means:', ['To be exactly right', 'To do carpentry', 'To fail', 'To injure oneself'], 0, 'To describe exactly what is causing a situation.');
S('e_vocab', 'One-word substitution: a person who loves books', ['Bibliophile', 'Philatelist', 'Misanthrope', 'Bibliographer'], 0, 'Bibliophile.');
S('e_vocab', 'One-word substitution: one who knows everything', ['Omnipotent', 'Omniscient', 'Omnipresent', 'Optimist'], 1, 'Omniscient.');
S('e_vocab', 'One-word substitution: fear of heights', ['Claustrophobia', 'Acrophobia', 'Hydrophobia', 'Xenophobia'], 1, 'Acrophobia.');
S('e_vocab', 'One-word substitution: a speech delivered without preparation', ['Extempore', 'Oration', 'Soliloquy', 'Monologue'], 0, 'Extempore.');
S('e_para', 'Rearrange: P. He reached the office late. Q. He woke up at nine. R. He missed the bus. S. The meeting had already started.', ['QRPS', 'PQRS', 'QPRS', 'RQPS'], 0, 'Woke up → missed bus → reached late → meeting started.');
const P1 = 'Insurance is a contract in which an individual or business receives financial protection against loss from an insurer in exchange for a premium. The insurer pools the premiums of many policyholders so that the losses of a few are paid from the contributions of many. Because the probability of loss can be estimated statistically for a large group, the insurer can price the risk fairly. Insurance therefore does not prevent losses but spreads their financial consequences.';
S('e_rc', 'What is the main idea of the passage?', ['Insurance prevents all losses', 'Insurance spreads the financial impact of loss across many people', 'Premiums should be avoided', 'Insurers lose money on most policies'], 1, 'The passage explains pooling of risk.', P1);
S('e_rc', 'According to the passage, insurers can price risk fairly because:', ['The government fixes prices', 'Probability of loss can be estimated statistically for a large group', 'Premiums are very low', 'Losses never occur'], 1, 'Stated directly.', P1);
S('e_rc', 'The passage suggests that insurance does NOT:', ['Spread financial consequences', 'Pool premiums', 'Prevent losses from occurring', 'Provide protection'], 2, '"Does not prevent losses but spreads their financial consequences".', P1);
const P2 = 'Regular saving, even in small amounts, builds wealth over time through the power of compounding. A person who invests a fixed sum every month earns returns not only on the original investment but also on the returns already earned. The earlier one starts, the longer the money has to grow. Delay, on the other hand, forces one to invest much larger sums later to reach the same goal.';
S('e_rc', 'Which is the most suitable title for the passage?', ['The Risks of Investing', 'The Power of Starting Early', 'Why Banks Fail', 'Spending Wisely'], 1, 'The passage stresses early, regular saving.', P2);
S('e_rc', 'Compounding, as used in the passage, means:', ['Earning returns on previous returns', 'Paying taxes on savings', 'Spending part of the money', 'Borrowing to invest'], 0, 'Returns are earned on earlier returns.', P2);
S('e_rc', 'The author implies that delaying investment:', ['Reduces risk', 'Requires larger sums later for the same goal', 'Has no effect', 'Guarantees losses'], 1, 'Stated in the last sentence.', P2);

/* ---------- Vocabulary (word, synonym, antonym) ---------- */
const VOCAB = [
  ['abate', 'subside', 'intensify'], ['abundant', 'plentiful', 'scarce'], ['accelerate', 'hasten', 'delay'], ['adept', 'skilled', 'inept'], ['adversity', 'hardship', 'prosperity'],
  ['aggravate', 'worsen', 'soothe'], ['alleviate', 'relieve', 'aggravate'], ['ambiguous', 'equivocal', 'explicit'], ['ample', 'sufficient', 'inadequate'], ['arduous', 'laborious', 'effortless'],
  ['authentic', 'genuine', 'fake'], ['benevolent', 'charitable', 'malevolent'], ['brevity', 'conciseness', 'verbosity'], ['candid', 'frank', 'evasive'], ['cease', 'stop', 'begin'],
  ['commence', 'begin', 'conclude'], ['conceal', 'hide', 'reveal'], ['condemn', 'denounce', 'applaud'], ['conserve', 'preserve', 'squander'], ['copious', 'profuse', 'meagre'],
  ['cunning', 'crafty', 'naive'], ['debilitate', 'weaken', 'invigorate'], ['diligent', 'industrious', 'lazy'], ['diminish', 'reduce', 'enlarge'], ['eloquent', 'articulate', 'inarticulate'],
  ['eminent', 'distinguished', 'obscure'], ['enormous', 'gigantic', 'tiny'], ['evade', 'dodge', 'confront'], ['exaggerate', 'overstate', 'understate'], ['feeble', 'frail', 'robust'],
  ['flourish', 'thrive', 'wither'], ['frugal', 'thrifty', 'extravagant'], ['futile', 'pointless', 'fruitful'], ['gloomy', 'dismal', 'cheerful'], ['hinder', 'obstruct', 'assist'],
  ['hostile', 'antagonistic', 'amicable'], ['humble', 'modest', 'arrogant'], ['impartial', 'unbiased', 'prejudiced'], ['inevitable', 'unavoidable', 'avoidable'], ['innocent', 'blameless', 'guilty'],
  ['keen', 'eager', 'indifferent'], ['lenient', 'merciful', 'harsh'], ['mitigate', 'lessen', 'aggravate'], ['obsolete', 'outdated', 'modern'], ['obstinate', 'stubborn', 'flexible'],
  ['optimistic', 'hopeful', 'pessimistic'], ['persistent', 'tenacious', 'wavering'], ['prudent', 'cautious', 'reckless'], ['rapid', 'swift', 'sluggish'], ['reluctant', 'unwilling', 'eager'],
  ['scarce', 'rare', 'plentiful'], ['serene', 'tranquil', 'turbulent'], ['sincere', 'honest', 'deceitful'], ['stagnant', 'motionless', 'dynamic'], ['tedious', 'monotonous', 'exciting'],
  ['timid', 'shy', 'bold'], ['transparent', 'see-through', 'opaque'], ['trivial', 'insignificant', 'vital'], ['vague', 'hazy', 'precise'], ['vivid', 'graphic', 'dull'],
  ['wary', 'cautious', 'careless'], ['zeal', 'enthusiasm', 'apathy'], ['pragmatic', 'practical', 'idealistic'], ['ephemeral', 'short-lived', 'permanent'], ['laconic', 'brief', 'wordy'],
  ['meticulous', 'careful', 'sloppy'], ['gregarious', 'sociable', 'reclusive'], ['venerable', 'respected', 'contemptible'], ['impetuous', 'rash', 'deliberate'], ['placid', 'peaceful', 'agitated'],
];

/* ---------- Generators ---------- */
function seriesQ(topic) {
  const k = pick(['ap', 'incr', 'gp', 'sqk', 'mulplus', 'alt']);
  let terms = [], ans, e;
  if (k === 'ap') { const a = rnd(2, 30), d = rnd(2, 9); terms = [0, 1, 2, 3, 4].map(i => a + d * i); ans = a + 5 * d; e = `Add ${d} each time.`; }
  else if (k === 'incr') { const s = rnd(1, 10), d0 = rnd(1, 4), inc = rnd(1, 3); let v = s, d = d0; terms = [v]; for (let i = 0; i < 4; i++) { v += d; d += inc; terms.push(v); } ans = v + d; e = `Differences are ${d0}, ${d0 + inc}, ${d0 + 2 * inc}... increasing by ${inc}.`; }
  else if (k === 'gp') { const a = rnd(1, 5), r = rnd(2, 3); terms = [0, 1, 2, 3, 4].map(i => a * r ** i); ans = a * r ** 5; e = `Multiply by ${r} each time.`; }
  else if (k === 'sqk') { const m = rnd(2, 9), c = pick([-3, -2, -1, 1, 2, 3, 4]); terms = [0, 1, 2, 3, 4].map(i => (m + i) ** 2 + c); ans = (m + 5) ** 2 + c; e = `Terms are n² ${c < 0 ? '−' : '+'} ${Math.abs(c)}, starting at n = ${m}.`; }
  else if (k === 'mulplus') { const s = rnd(1, 5), m = rnd(2, 3), c = pick([-2, -1, 1, 2]); let v = s; terms = [v]; for (let i = 0; i < 4; i++) { v = v * m + c; terms.push(v); } ans = v * m + c; e = `Each term = previous × ${m} ${c < 0 ? '−' : '+'} ${Math.abs(c)}.`; }
  else { const a = rnd(2, 20), d1 = rnd(2, 6), b = rnd(5, 40), d2 = rnd(3, 9); terms = [a, b, a + d1, b + d2, a + 2 * d1, b + 2 * d2]; ans = a + 3 * d1; e = `Two alternating series: ${a}, ${a + d1}, ${a + 2 * d1}... (+${d1}) and ${b}, ${b + d2}, ${b + 2 * d2}... (+${d2}).`; }
  return numQ(topic, `What comes next in the series?  ${terms.join(', ')}, ?`, ans, e, { dec: 0 });
}

function inequalityQ() {
  const sym = ['>', '<', '≥', '≤', '='];
  const comb = (st, r) => {
    if (st === 'NONE') return 'NONE';
    const map = { '>': 'GT', '<': 'LT', '≥': 'GE', '≤': 'LE', '=': 'EQ' };
    const rr = map[r];
    if (st === 'EQ') return rr;
    if (rr === 'EQ') return st;
    const gt = ['GT', 'GE'], lt = ['LT', 'LE'];
    if ((gt.includes(st) && lt.includes(rr)) || (lt.includes(st) && gt.includes(rr))) return 'NONE';
    const strict = st === 'GT' || st === 'LT' || rr === 'GT' || rr === 'LT';
    return gt.includes(st) ? (strict ? 'GT' : 'GE') : (strict ? 'LT' : 'LE');
  };
  const holds = (st, c) => ({ GT: ['>', '≥'], GE: ['≥'], LT: ['<', '≤'], LE: ['≤'], EQ: ['=', '≥', '≤'], NONE: [] }[st].includes(c));
  const letters = shuffle(['P', 'Q', 'R', 'S', 'T', 'M', 'N', 'K']).slice(0, 4);
  const r = [pick(sym), pick(sym), pick(sym)];
  let st = 'EQ'; r.forEach(x => { st = comb(st, x); });
  const comp = { '>': '≤', '≤': '>', '<': '≥', '≥': '<' };
  const c1 = pick(['>', '<', '≥', '≤']);
  const c2 = Math.random() < 0.4 ? comp[c1] : pick(['>', '<', '≥', '≤', '=']);
  const t1 = holds(st, c1), t2 = holds(st, c2);
  let ans;
  if (t1 && t2) ans = 'Both follow'; else if (t1) ans = 'Only I follows'; else if (t2) ans = 'Only II follows';
  else ans = (comp[c1] === c2) ? 'Either I or II follows' : 'Neither follows';
  const stmt = `${letters[0]} ${r[0]} ${letters[1]} ${r[1]} ${letters[2]} ${r[2]} ${letters[3]}`;
  return { t: 'r_ineq', q: `Statement: ${stmt}\nConclusions:  I. ${letters[0]} ${c1} ${letters[3]}    II. ${letters[0]} ${c2} ${letters[3]}`, o: ['Only I follows', 'Only II follows', 'Either I or II follows', 'Neither follows', 'Both follow'], a: ['Only I follows', 'Only II follows', 'Either I or II follows', 'Neither follows', 'Both follow'].indexOf(ans), e: `Combining the chain gives ${st === 'NONE' ? 'no definite relation' : 'a definite relation'} between ${letters[0]} and ${letters[3]}. Same-direction signs combine; opposite directions give no relation.` };
}

function codingQ() {
  const words = ['BANK', 'LOAN', 'RISK', 'CLAIM', 'POLICY', 'LIFE', 'PREMIUM', 'CASH', 'SAVING', 'FUND', 'TRUST', 'AGENT', 'BONUS', 'LAPSE'];
  const shift = pick([1, 2, 3, -1, -2]);
  const enc = w => [...w].map(c => String.fromCharCode((c.charCodeAt(0) - 65 + shift + 26) % 26 + 65)).join('');
  const [w1, w2] = shuffle(words);
  const ans = enc(w2);
  const wrong = shuffle([-3, -2, -1, 1, 2, 3, 4].filter(x => x !== shift)).slice(0, 3).map(s => [...w2].map(c => String.fromCharCode((c.charCodeAt(0) - 65 + s + 26) % 26 + 65)).join(''));
  const opts = shuffle([ans, ...wrong]);
  return { t: 'r_ser', q: `In a certain code, ${w1} is written as ${enc(w1)}. How is ${w2} written in that code?`, o: opts, a: opts.indexOf(ans), e: `Every letter is shifted by ${shift > 0 ? '+' : ''}${shift}.` };
}

function alphaPosQ() {
  const k = rnd(0, 1);
  if (k === 0) { const l = rnd(2, 25), c = String.fromCharCode(64 + l); return strQ('r_ser', `Which letter is the mirror (opposite) of ${c} in the English alphabet?`, String.fromCharCode(64 + 27 - l), ['A', 'B', 'D', 'H', 'K', 'M', 'P', 'W', 'Y'].filter(x => x !== String.fromCharCode(64 + 27 - l)), `Position of ${c} is ${l}; opposite is 27 − ${l} = ${27 - l}.`); }
  const l = rnd(3, 20), n = rnd(2, 5);
  return strQ('r_ser', `Which letter is ${n} places to the right of ${String.fromCharCode(64 + l)} in the alphabet?`, String.fromCharCode(64 + l + n), [l + n + 1, l + n - 1, l + n + 2, l - n].filter(x => x > 0 && x < 27).map(x => String.fromCharCode(64 + x)), `${String.fromCharCode(64 + l)} is #${l}; ${n} to the right is #${l + n}.`);
}

function rankQ() {
  const n = rnd(30, 60), top = rnd(5, n - 5);
  const k = rnd(0, 1);
  if (k === 0) return numQ('r_rank', `In a class of ${n} students, Arjun ranks ${top}th from the top. What is his rank from the bottom?`, n - top + 1, `${n} − ${top} + 1 = ${n - top + 1}.`, { dec: 0 });
  const r = rnd(5, 15), l = rnd(5, 15);
  return numQ('r_rank', `In a row, Neha is ${l}th from the left and ${r}th from the right. How many people are in the row?`, l + r - 1, `${l} + ${r} − 1 = ${l + r - 1}.`, { dec: 0 });
}

function directionQ() {
  const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
  const extra = rnd(2, 6);
  const dirs = pick([['North', 'East', 'South'], ['East', 'South', 'West'], ['South', 'West', 'North'], ['West', 'North', 'East']]);
  const q = `A person walks ${a + extra} km ${dirs[0]}, then turns right and walks ${b} km, then turns right and walks ${extra} km. How far is he from the starting point?`;
  return numQ('r_dir', q, c, `Net ${a} km along the first direction and ${b} km sideways, so distance = √(${a}² + ${b}²) = ${c} km.`, { unit: ' km', dec: 0 });
}

function seatingQ() {
  const names = shuffle(['A', 'B', 'C', 'D', 'E', 'F']).slice(0, 5);
  const perms = []; const gen = (arr, cur = []) => { if (!arr.length) { perms.push(cur); return; } arr.forEach((x, i) => gen(arr.filter((_, j) => j !== i), [...cur, x])); }; gen(names);
  const facts = p => {
    const f = [];
    f.push({ t: `${p[0]} sits at the extreme left.`, ok: x => x[0] === p[0] });
    f.push({ t: `${p[4]} sits at the extreme right.`, ok: x => x[4] === p[4] });
    f.push({ t: `${p[2]} sits in the middle.`, ok: x => x[2] === p[2] });
    f.push({ t: `${p[1]} sits immediately to the left of ${p[2]}.`, ok: x => x.indexOf(p[1]) + 1 === x.indexOf(p[2]) });
    f.push({ t: `${p[3]} sits immediately to the right of ${p[2]}.`, ok: x => x.indexOf(p[3]) - 1 === x.indexOf(p[2]) });
    f.push({ t: `${p[0]} is not at the right end.`, ok: x => x[4] !== p[0] });
    return f;
  };
  for (let tries = 0; tries < 60; tries++) {
    const p = pick(perms), fs = shuffle(facts(p)).slice(0, 4);
    const sat = perms.filter(x => fs.every(f => f.ok(x)));
    const pos = pick([1, 3]);
    if (sat.every(x => x[pos] === p[pos])) {
      const label = ['first from the left', 'second from the left', 'third from the left', 'second from the right', 'extreme right'][pos === 1 ? 1 : 3];
      return strQ('r_lin', `Five friends (${names.slice().sort().join(', ')}) sit in a row facing north.\n${fs.map(f => f.t).join(' ')}\nWho sits ${label}?`, p[pos], names, `The facts fix the order as ${p.join(' – ')} (left to right).`);
    }
  }
  return null;
}

const VCLUSTERS = [['scarce', 'meagre', 'inadequate', 'rare'], ['plentiful', 'abundant', 'sufficient', 'profuse'], ['explicit', 'precise', 'graphic', 'vivid'], ['intensify', 'aggravate', 'worsen', 'invigorate', 'strengthen'], ['careless', 'sloppy', 'reckless', 'rash'], ['sluggish', 'lazy', 'dull', 'motionless'], ['peaceful', 'tranquil', 'placid'], ['agitated', 'turbulent', 'wavering', 'dynamic'], ['enlarge', 'increase'], ['eager', 'enthusiasm', 'zeal'], ['apathy', 'indifferent'], ['squander', 'waste'], ['unwilling', 'reluctant'], ['deceitful', 'evasive', 'naive'], ['robust', 'invigorate', 'dynamic', 'strengthen'], ['guilty', 'contemptible', 'malevolent'], ['effortless', 'easy'], ['wordy', 'verbosity'], ['harsh', 'strict', 'antagonistic'], ['amicable', 'friendly', 'sociable'], ['pointless', 'futile', 'insignificant', 'trivial'], ['arrogant', 'prejudiced'], ['hasten', 'rapid', 'swift'], ['hide', 'conceal'], ['exciting', 'cheerful'], ['bold', 'idealistic']];
const vconflict = (x, c) => VCLUSTERS.some(g => g.includes(x) && g.includes(c));
function vocabQ(kind) {
  const k = kind || pick(['syn', 'ant']);
  const [w, syn, ant] = pick(VOCAB);
  const pool = VOCAB.map(v => k === 'syn' ? v[1] : v[2]);
  const correct = k === 'syn' ? syn : ant;
  return strQ('e_vocab', `Choose the word ${k === 'syn' ? 'closest in meaning' : 'opposite in meaning'} to "${w.toUpperCase()}".`, correct, pool.filter(x => x !== syn && x !== ant && !vconflict(x, correct) && !vconflict(x, k === 'syn' ? ant : syn)), `${w}: synonym ${syn}; antonym ${ant}.`);
}

const dataTable = (rows, years, labels) => `<table class="dt"><tr><th></th>${years.map(y => `<th>${y}</th>`).join('')}</tr>${rows.map((r, i) => `<tr><th>${labels[i]}</th>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</table>`;

const GEN = {
  q_basics() {
    const k = rnd(0, 2);
    if (k === 0) { const a = rnd(12, 29), b = rnd(11, 19); return numQ('q_basics', `Calculate ${a} × ${b}.`, a * b, `${a} × ${b} = ${a * b}.`, { dec: 0 }); }
    if (k === 1) { const n = rnd(31, 59); return numQ('q_basics', `What is ${n}²?`, n * n, `${n}² = ${n * n}.`, { dec: 0 }); }
    const a = rnd(52, 98), b = rnd(11, 49);
    return numQ('q_basics', `Find the value of ${a}² − ${b}².`, a * a - b * b, `a² − b² = (a+b)(a−b) = ${a + b} × ${a - b} = ${a * a - b * b}.`, { dec: 0 });
  },
  q_num() {
    const k = rnd(0, 3);
    if (k === 0) { const g = rnd(3, 15); const [m, n] = pick([[2, 3], [3, 5], [4, 7], [5, 6], [3, 4], [5, 7]]); return numQ('q_num', `What is the HCF of ${g * m} and ${g * n}?`, g, `HCF = ${g}; the numbers are ${g}×${m} and ${g}×${n}, with coprime multipliers.`, { dec: 0 }); }
    if (k === 1) { const g = rnd(2, 9); const [m, n] = pick([[2, 3], [3, 5], [4, 7], [5, 6], [3, 4]]); return numQ('q_num', `What is the LCM of ${g * m} and ${g * n}?`, g * m * n, `LCM = ${g} × ${m} × ${n} = ${g * m * n}.`, { dec: 0 }); }
    if (k === 2) { const d = pick([9, 11, 7, 13]), N = rnd(500, 4000); return numQ('q_num', `What is the remainder when ${N} is divided by ${d}?`, N % d, `${N} = ${d} × ${Math.floor(N / d)} + ${N % d}.`, { dec: 0 }); }
    const b = rnd(2, 9), e = rnd(10, 60); let u = 1; for (let i = 0; i < e; i++) u = (u * b) % 10;
    return numQ('q_num', `What is the unit digit of ${b}^${e}?`, u, 'Unit digits of powers repeat in cycles; reduce the exponent by the cycle length.', { dec: 0 });
  },
  q_pct() {
    const k = rnd(0, 3);
    if (k === 0) { const p = pick([12.5, 15, 20, 25, 35, 40, 45, 60, 75]), N = 80 * rnd(2, 12); return numQ('q_pct', `What is ${p}% of ${N}?`, p * N / 100, `${p}% of ${N} = ${p * N / 100}.`); }
    if (k === 1) { const a = pick([10, 20, 25, 30, 40, 50]), b = pick([10, 20, 25, 30]); const net = a - b - a * b / 100; return numQ('q_pct', `A number is increased by ${a}% and then decreased by ${b}%. What is the net percentage change? (Negative = decrease)`, net, `a + b + ab/100 with b negative: ${a} − ${b} − ${a * b / 100} = ${net}%.`, { unit: '%' }); }
    if (k === 2) { const x = pick([10, 20, 25, 50]), O = 40 * rnd(2, 15); return numQ('q_pct', `A number increased by ${x}% becomes ${O * (100 + x) / 100}. What is the original number?`, O, `Original = ${O * (100 + x) / 100} × 100/${100 + x} = ${O}.`); }
    const M = pick([50, 80, 100, 200, 400, 500]), m = M * pick([0.45, 0.5, 0.6, 0.65, 0.7, 0.75, 0.8]);
    return numQ('q_pct', `A student scores ${m} out of ${M}. What is the percentage?`, m / M * 100, `${m}/${M} × 100 = ${trim(m / M * 100)}%.`, { unit: '%' });
  },
  q_ratio() {
    const k = rnd(0, 2);
    if (k === 0) { const a = rnd(2, 7), b = rnd(2, 8); if (a === b) return GEN.q_ratio(); const m = rnd(5, 30) * 10; const T = m * (a + b); return numQ('q_ratio', `₹${T} is divided between A and B in the ratio ${a}:${b}. What is the larger share?`, m * Math.max(a, b), `One part = ${T}/${a + b} = ${m}; larger share = ${Math.max(a, b)} × ${m}.`, { pre: '₹', dec: 0 }); }
    if (k === 1) { const [a, b, c, d] = [rnd(1, 5), rnd(2, 7), rnd(2, 7), rnd(2, 8)]; if (a === b || c === d) return GEN.q_ratio(); const x = a * c, y = b * d; const correct = ratioStr(x, y); return strQ('q_ratio', `If A:B = ${a}:${b} and B:C = ${c}:${d}, what is A:C?`, correct, [ratioStr(a * d, b * c), ratioStr(a + c, b + d), ratioStr(a * c, b + d), ratioStr(a * b, c * d), ratioStr(b * c, a * d + 1)], `A:B:C = ${a * c}:${b * c}:${b * d}, so A:C = ${correct}.`); }
    const [wa, wb] = pick([[2, 3], [1, 2], [3, 4], [2, 5]]); const ia = wa * 12, ib = wb * 6; const g = gcd(ia, ib); const ra = ia / g, rb = ib / g; const mult = rnd(2, 9) * 100; const P = mult * (ra + rb);
    return numQ('q_ratio', `A invests ₹${wa * 1000} for 12 months and B invests ₹${wb * 1000} for 6 months. The total profit is ₹${P}. What is A's share?`, mult * ra, `Profit ratio = (${wa * 1000}×12) : (${wb * 1000}×6) = ${ra}:${rb}. A's share = ${ra}/${ra + rb} × ${P}.`, { pre: '₹', dec: 0 });
  },
  q_avg() {
    const k = rnd(0, 2);
    if (k === 0) { const A = rnd(20, 40), B = rnd(15, 35); const ans = 5 * A - 4 * B; if (ans <= 0) return GEN.q_avg(); return numQ('q_avg', `The average of 5 numbers is ${A}. When one number is excluded, the average of the remaining numbers becomes ${B}. What is the excluded number?`, ans, `5×${A} − 4×${B} = ${ans}.`, { dec: 0 }); }
    if (k === 1) { const n = rnd(10, 40); return numQ('q_avg', `What is the average of the first ${n} even natural numbers?`, n + 1, `Sum = n(n+1), so average = n + 1 = ${n + 1}.`, { dec: 0 }); }
    const n = pick([19, 24, 29, 34]), x = rnd(14, 30), kk = rnd(1, 3), y = x + kk * (n + 1);
    return numQ('q_avg', `The average age of ${n} students is ${x} years. When a teacher aged ${y} years is included, what is the new average age?`, x + kk, `(${n}×${x} + ${y})/${n + 1} = ${x + kk}.`, { unit: ' years', dec: 0 });
  },
  q_pl() {
    const k = rnd(0, 3);
    if (k === 0) { const cp = 20 * rnd(10, 60), p = pick([10, 15, 20, 25, 30]); return numQ('q_pl', `An article costs ₹${cp}. At what price must it be sold to earn ${p}% profit?`, cp * (100 + p) / 100, `SP = ${cp} × ${100 + p}/100.`, { pre: '₹' }); }
    if (k === 1) { const mp = 100 * rnd(5, 40), d = pick([5, 10, 15, 20, 25]); return numQ('q_pl', `The marked price of a shirt is ₹${mp}. A discount of ${d}% is given. What is the selling price?`, mp * (100 - d) / 100, `SP = ${mp} × ${100 - d}/100.`, { pre: '₹' }); }
    if (k === 2) { const cp = 20 * rnd(10, 50), p = pick([10, 20, 25, 30]); return numQ('q_pl', `By selling an article for ₹${cp * (100 + p) / 100}, a shopkeeper gains ${p}%. What is the cost price?`, cp, `CP = ${cp * (100 + p) / 100} × 100/${100 + p} = ${cp}.`, { pre: '₹' }); }
    const m = pick([20, 25, 40, 50]), d = pick([10, 20, 25]); const pr = (100 + m) * (100 - d) / 100 - 100;
    return numQ('q_pl', `A shopkeeper marks goods ${m}% above cost and allows a ${d}% discount. What is his profit or loss %? (Negative = loss)`, pr, `Net = (100+${m})(100−${d})/100 − 100 = ${trim(pr)}%.`, { unit: '%' });
  },
  q_si() {
    const k = rnd(0, 3);
    if (k === 0) { const P = 1000 * rnd(2, 20), R = rnd(4, 12), T = rnd(2, 5); return numQ('q_si', `Find the simple interest on ₹${P} at ${R}% per annum for ${T} years.`, P * R * T / 100, `SI = PRT/100 = ${P}×${R}×${T}/100.`, { pre: '₹', dec: 0 }); }
    if (k === 1) { const [R, m] = pick([[10, 0.21], [20, 0.44], [5, 0.1025]]); const P = 4000 * rnd(1, 6); return numQ('q_si', `Find the compound interest on ₹${P} at ${R}% per annum for 2 years.`, +(P * m).toFixed(2), `CI = P[(1 + R/100)² − 1] = ${P} × ${m}.`, { pre: '₹' }); }
    if (k === 2) { const R = pick([10, 20]), P = 500 * rnd(2, 20); return numQ('q_si', `What is the difference between compound and simple interest on ₹${P} at ${R}% per annum for 2 years?`, P * (R / 100) ** 2, `Difference = P(R/100)² = ${P}×(${R}/100)².`, { pre: '₹' }); }
    const n = pick([4, 5, 8, 10, 20, 25]); return numQ('q_si', `At what rate % per annum simple interest will a sum double itself in ${n} years?`, 100 / n, `Interest = principal, so R = 100/T = 100/${n}.`, { unit: '%' });
  },
  q_tw() {
    const pairs = [[12, 6, 4], [20, 5, 4], [15, 10, 6], [30, 15, 10], [12, 4, 3], [24, 8, 6], [18, 9, 6], [36, 18, 12], [10, 40, 8], [45, 90, 30], [60, 20, 15], [16, 16, 8]];
    const pipes = [[6, 12, 12], [10, 15, 30], [12, 20, 30], [8, 24, 12], [15, 30, 30], [20, 30, 60], [12, 16, 48], [6, 9, 18], [4, 12, 6]];
    const k = rnd(0, 2);
    if (k === 0) { const [x, y, t] = pick(pairs); return numQ('q_tw', `A can do a piece of work in ${x} days and B alone can do it in ${y} days. In how many days can they finish it working together?`, t, `Together = xy/(x+y) = ${x * y}/${x + y} = ${t} days.`, { unit: ' days', dec: 0 }); }
    if (k === 1) { const [x, y, t] = pick(pairs); return numQ('q_tw', `A can complete a work in ${x} days. A and B together complete it in ${t} days. In how many days can B alone complete it?`, y, `1/B = 1/${t} − 1/${x} = 1/${y}.`, { unit: ' days', dec: 0 }); }
    const [x, y, t] = pick(pipes); return numQ('q_tw', `A pipe can fill a tank in ${x} hours and an outlet pipe can empty it in ${y} hours. If both are opened together, in how many hours will the empty tank be filled?`, t, `Net rate = 1/${x} − 1/${y}; time = xy/(y−x) = ${t} hours.`, { unit: ' hours', dec: 0 });
  },
  q_tsd() {
    const k = rnd(0, 3);
    if (k === 0) { const v = pick([36, 54, 72, 90, 108]), t = rnd(5, 20); return numQ('q_tsd', `A train running at ${v} km/h crosses a pole in ${t} seconds. What is the length of the train?`, v * 5 / 18 * t, `${v} km/h = ${v * 5 / 18} m/s; length = speed × time.`, { unit: ' m', dec: 0 }); }
    if (k === 1) { const S = pick([72, 90, 108, 126, 144]), s1 = 9 * rnd(2, S / 9 - 2), s2 = S - s1, r = S * 5 / 18, t = rnd(5, 12), tot = r * t, l1 = Math.round(tot * pick([0.4, 0.5, 0.6]) / 5) * 5, l2 = tot - l1; if (l2 <= 0) return GEN.q_tsd(); return numQ('q_tsd', `Two trains of lengths ${l1} m and ${l2} m run in opposite directions at ${s1} km/h and ${s2} km/h. How long will they take to cross each other?`, t, `Relative speed = ${S} km/h = ${r} m/s; time = (${l1}+${l2})/${r}.`, { unit: ' s', dec: 0 }); }
    if (k === 2) { const a = pick([12, 16, 20, 24]), b = a - pick([4, 6, 8]); const D = a * b / gcd(a, b) * 1; return numQ('q_tsd', `A boat goes ${D} km downstream in ${D / a} hours and returns upstream in ${D / b} hours. What is the speed of the boat in still water?`, (a + b) / 2, `Downstream ${a}, upstream ${b}; still water = (${a}+${b})/2.`, { unit: ' km/h', dec: 0 }); }
    const [x, y] = pick([[40, 60], [30, 60], [20, 30], [60, 90], [50, 75], [40, 120], [10, 15], [60, 120]]); return numQ('q_tsd', `A man travels from A to B at ${x} km/h and returns at ${y} km/h. What is his average speed for the whole journey?`, 2 * x * y / (x + y), `Average = 2xy/(x+y) = 2×${x}×${y}/${x + y}.`, { unit: ' km/h' });
  },
  q_mix() {
    const k = rnd(0, 2);
    if (k === 0) { const a = 20 * rnd(1, 4), b = a + 10 * rnd(2, 5), m = a + (b - a) * pick([0.2, 0.4, 0.5, 0.6]); const x = b - m, y = m - a; if (!Number.isInteger(x) || !Number.isInteger(y)) return GEN.q_mix(); return strQ('q_mix', `Rice costing ₹${a}/kg is mixed with rice costing ₹${b}/kg to get a mixture worth ₹${m}/kg. In what ratio (cheaper : dearer) are they mixed?`, ratioStr(x, y), [ratioStr(y, x), ratioStr(x + 1, y), ratioStr(x, y + 2), '1:1', '2:3', '3:2'], `Alligation: (${b} − ${m}) : (${m} − ${a}) = ${x}:${y}.`); }
    if (k === 1) { const T = rnd(8, 40), x = rnd(2, T / 2 | 0); if (x * 2 === T) return GEN.q_mix(); return strQ('q_mix', `A vessel has ${T} litres of pure milk. ${x} litres are removed and replaced with water. What is the ratio of milk to water now?`, ratioStr(T - x, x), [ratioStr(x, T - x), ratioStr(T, x), ratioStr(T - x, x + 1), '1:1', '2:1'], `Milk = ${T - x}, water = ${x}.`); }
    const [a, b] = pick([[3, 1], [5, 3], [7, 3], [2, 1], [5, 1]]); const T = (a + b) * rnd(3, 10);
    return numQ('q_mix', `A ${T}-litre mixture contains milk and water in the ratio ${a}:${b}. How much water must be added to make the ratio 1:1?`, T * (a - b) / (a + b), `Milk = ${T * a / (a + b)} L, water = ${T * b / (a + b)} L; add the difference.`, { unit: ' L', dec: 0 });
  },
  q_pnc() {
    const k = rnd(0, 2);
    if (k === 0) { const n = rnd(5, 10), r = rnd(2, 4); return numQ('q_pnc', `In how many ways can a committee of ${r} be chosen from ${n} people?`, nCr(n, r), `${n}C${r} = ${nCr(n, r)}.`, { dec: 0 }); }
    if (k === 1) { const w = pick(['LEVEL', 'BANANA', 'APPLE', 'INSURE', 'POLICY', 'PREMIUM', 'BANK', 'DEPOSIT', 'CLAIM', 'SAVING', 'LOAN']); const cnt = {}; [...w].forEach(c => cnt[c] = (cnt[c] || 0) + 1); const ans = Object.values(cnt).reduce((a, c) => a / fact(c), fact(w.length)); return numQ('q_pnc', `How many different arrangements can be made from the letters of the word "${w}"?`, ans, `${w.length}! divided by the factorial of each repeated letter's count.`, { dec: 0 }); }
    const s = rnd(4, 10), ways = 6 - Math.abs(s - 7); const correct = fracStr(ways, 36);
    return strQ('q_pnc', `Two fair dice are thrown. What is the probability that the sum is ${s}?`, correct, [2, 3, 4, 5, 6, 1, 8, 9].map(w => fracStr(w, 36)), `${ways} favourable outcomes out of 36.`);
  },
  q_geo() {
    const k = rnd(0, 3);
    if (k === 0) { const r = 7 * rnd(1, 4); return numQ('q_geo', `Find the area of a circle of radius ${r} cm. (π = 22/7)`, 22 / 7 * r * r, `Area = πr² = 22/7 × ${r}².`, { unit: ' cm²', dec: 0 }); }
    if (k === 1) { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]), m = rnd(1, 4); return numQ('q_geo', `The sides of a rectangle are ${a * m} m and ${b * m} m. What is the length of its diagonal?`, c * m, `√(${a * m}² + ${b * m}²) = ${c * m}.`, { unit: ' m', dec: 0 }); }
    if (k === 2) { const h = rnd(2, 12); return numQ('q_geo', `Find the volume of a cylinder with radius 7 cm and height ${h} cm. (π = 22/7)`, 154 * h, `V = πr²h = 22/7 × 49 × ${h}.`, { unit: ' cm³', dec: 0 }); }
    const a = rnd(3, 15); return numQ('q_geo', `What is the total surface area of a cube of side ${a} cm?`, 6 * a * a, `TSA = 6a² = 6 × ${a}².`, { unit: ' cm²', dec: 0 });
  },
  q_ns() { return seriesQ('q_ns'); },
  q_quad() {
    let r1, r2; do { r1 = rnd(-9, 9); r2 = rnd(-9, 9); } while (!r1 || !r2 || r1 === r2);
    const S = r1 + r2, P = r1 * r2; const fmt = `x² ${S === 0 ? '' : (-S < 0 ? '− ' : '+ ') + Math.abs(S) + 'x '}${P < 0 ? '− ' : '+ '}${Math.abs(P)} = 0`;
    if (Math.random() < 0.5) return numQ('q_quad', `Find the larger root of ${fmt}`, Math.max(r1, r2), `Roots are ${r1} and ${r2}.`, { dec: 0 });
    return numQ('q_quad', `What is the product of the roots of ${fmt}`, P, `Product = c/a = ${P}; the roots are ${r1} and ${r2}.`, { dec: 0 });
  },
  q_di() {
    const years = [2021, 2022, 2023, 2024, 2025], A = years.map(() => rnd(10, 40) * 10), B = years.map(() => rnd(10, 40) * 10);
    const table = dataTable([A, B], years, ['Company A (₹ lakh)', 'Company B (₹ lakh)']);
    const k = rnd(0, 3);
    if (k === 0) { const i = rnd(0, 3), g = pick([10, 20, 25, 50]); A[i] = 40 * rnd(3, 9); A[i + 1] = A[i] * (100 + g) / 100; return numQ('q_di', `By what percentage did Company A's sales increase from ${years[i]} to ${years[i + 1]}?`, g, `(${A[i + 1]} − ${A[i]})/${A[i]} × 100.`, { unit: '%', p: dataTable([A, B], years, ['Company A (₹ lakh)', 'Company B (₹ lakh)']) }); }
    if (k === 1) { const y = rnd(0, 4); return numQ('q_di', `What were the total sales of A and B together in ${years[y]}? (₹ lakh)`, A[y] + B[y], `${A[y]} + ${B[y]}.`, { p: table, dec: 0 }); }
    if (k === 2) { const s = A.reduce((a, b) => a + b, 0); A[4] += (5 - s % 5) % 5; const s2 = A.reduce((a, b) => a + b, 0); return numQ('q_di', `What is the average yearly sales of Company A over the five years? (₹ lakh)`, s2 / 5, `Total ${s2} ÷ 5.`, { p: dataTable([A, B], years, ['Company A (₹ lakh)', 'Company B (₹ lakh)']), dec: 0 }); }
    const y = rnd(0, 4); return strQ('q_di', `What is the ratio of Company A's sales to Company B's sales in ${years[y]}?`, ratioStr(A[y], B[y]), [ratioStr(B[y], A[y]), ratioStr(A[y] + 10, B[y]), ratioStr(A[y], B[y] + 10), '1:1', '3:2', '2:3'], `${A[y]}:${B[y]} in simplest form.`, table);
  },
  r_ser() { return Math.random() < 0.4 ? seriesQ('r_ser') : Math.random() < 0.7 ? codingQ() : alphaPosQ(); },
  r_ineq: inequalityQ,
  r_rank: rankQ,
  r_dir: directionQ,
  r_lin: () => seatingQ(),
  e_vocab: () => vocabQ(),
};

/* ---------- Public API ---------- */
const tidy = q => { q.id = hashStr(q.q + (q.p || '') + q.o.join('|')); q.s = (TOPIC_BY_ID[q.t] || {}).s; return q; };
function shuffled(q) { const idx = shuffle(q.o.map((_, i) => i)); return Object.assign({}, q, { o: idx.map(i => q.o[i]), a: idx.indexOf(q.a) }); }
function staticFor(t) { return STATIC.filter(q => q.t === t); }

/* Returns n questions for the given topics, mixing static & generated, without duplicates. */
function getQuestions(topicIds, n, opts = {}) {
  const has = t => GEN[t] || staticFor(t).length;
  let usable = topicIds.filter(has);
  if (!usable.length) { const subj = (TOPIC_BY_ID[topicIds[0]] || {}).s; usable = topicsOf(subj).filter(has); }
  const out = [], seen = new Set(), ids = shuffle(usable);
  const add = q => { if (!q) return false; q = tidy(q); if (seen.has(q.id)) return false; seen.add(q.id); out.push(q); return true; };
  const staticPool = shuffle(ids.flatMap(t => staticFor(t).map(q => shuffled(q))));
  let guard = 0, si = 0;
  while (out.length < n && guard++ < n * 40) {
    const t = ids[guard % ids.length];
    const useStatic = si < staticPool.length && (!GEN[t] || Math.random() < 0.45 || !opts.preferGen);
    if (useStatic && si < staticPool.length) { add(staticPool[si++]); continue; }
    if (GEN[t]) { add(GEN[t]()); continue; }
    if (si < staticPool.length) add(staticPool[si++]);
    else if (!ids.some(x => GEN[x])) { const again = ids.flatMap(x => staticFor(x)); if (!again.length) break; seen.clear(); add(shuffled(pick(again))); }
  }
  return out;
}
const topicsOf = s => TOPICS.filter(t => t.s === s).map(t => t.id);
