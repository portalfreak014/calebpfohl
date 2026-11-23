import { readFile, writeFile } from 'node:fs/promises';
const file = 'arabic/glossary.html';
let html = await readFile(file, 'utf8');
for (const src of ['data/units-manifest.js', 'glossary-quiz.js']) {
  if (!html.includes('src="' + src + '"')) {
    if (!html.includes('</body>')) throw new Error('Glossary body closing tag missing');
    html = html.replace('</body>', '<script src="' + src + '" defer></script>\n</body>');
  }
}
await writeFile(file, html);
console.log('Prepared glossary chapter quiz actions.');

const quizFile = 'arabic/quiz.html';
let quiz = await readFile(quizFile, 'utf8');
if (!quiz.includes('/* fursa-flag-attribution-v1 */')) {
  const block = /    function readFlagQueue\(\)[\s\S]*?\n\n    function updateAudioButton\(\)/;
  if (!block.test(quiz)) throw new Error('Quiz reporting structure changed');
  const reporting = `    /* fursa-flag-attribution-v1 */
    let flagAuthPromise;
    let flagFlushPromise = null;
    function flagAuth() {
      if (!flagAuthPromise) flagAuthPromise = import('./firebase-auth.js').then(async ({ auth }) => { await auth.authStateReady(); return auth; }).catch(error => { flagAuthPromise = null; throw error; });
      return flagAuthPromise;
    }
    function readFlagQueue() { try { const queue = JSON.parse(localStorage.getItem(FLAG_QUEUE_KEY) || '[]'); return Array.isArray(queue) ? queue.slice(0,50) : []; } catch { return []; } }
    function writeFlagQueue(queue) { localStorage.setItem(FLAG_QUEUE_KEY, JSON.stringify(queue.slice(0,50))); }
    function currentFlagPayload() { const q = state.questions[state.index]; return { timestamp:new Date().toISOString(), unitId:unit, chapterId:unitQuiz ? q.chapterId : state.chapterId, mode, arabic:q.arabic, correctAnswer:mode === 'en-to-ar' || mode === 'written-answer' ? q.arabic : q.english }; }
    async function sendFlag(payload) {
      const headers = {'Content-Type':'application/json'};
      if (payload.reporterUid) {
        const auth = await flagAuth();
        const user = auth.currentUser;
        if (user && user.uid === payload.reporterUid) headers.Authorization = 'Bearer ' + await user.getIdToken();
      }
      const {reporterUid, ...details} = payload;
      const response = await fetch(FLAG_ENDPOINT, {method:'POST', headers, body:JSON.stringify(details)});
      if (!response.ok) throw new Error('Flag endpoint unavailable.');
    }
    function flushFlagQueue() {
      if (flagFlushPromise) return flagFlushPromise;
      flagFlushPromise = (async () => {
        for (const payload of readFlagQueue()) {
          try { await sendFlag(payload); } catch { break; }
          const current = readFlagQueue();
          const index = current.findIndex(item => JSON.stringify(item) === JSON.stringify(payload));
          if (index !== -1) { current.splice(index, 1); writeFlagQueue(current); }
        }
      })().catch(() => {}).finally(() => { flagFlushPromise = null; });
      return flagFlushPromise;
    }
    async function flagCurrentWord() {
      const button = $('flag-button');
      if (button.disabled || !state.questions[state.index]) return;
      button.disabled = true;
      const payload = currentFlagPayload();
      try {
        let auth;
        try { auth = await flagAuth(); }
        catch { showSnackbar('Unable to check sign-in. Please try flagging again.'); return; }
        payload.reporterUid = auth.currentUser ? auth.currentUser.uid : null;
        const queue = readFlagQueue();
        if (queue.length >= 50) { showSnackbar('Flag queue is full. Reconnect before flagging more words.'); return; }
        queue.push(payload);
        writeFlagQueue(queue);
        trackEvent('word_flagged',{unit_id:payload.unitId,chapter_id:payload.chapterId,mode});
        await flushFlagQueue();
        const pending = readFlagQueue().some(item => JSON.stringify(item) === JSON.stringify(payload));
        showSnackbar(pending ? 'Saved to send later.' : 'Word flagged for correction, thank you!');
      } catch { showSnackbar('Could not save this flag. Please try again.'); }
      finally { button.disabled = false; }
    }

    function updateAudioButton()`;
  quiz = quiz.replace(block, () => reporting);
  const prompt = '<h1 class="prompt" id="prompt">';
  if (!quiz.includes(prompt)) throw new Error('Quiz prompt structure changed');
  quiz = quiz.replace(prompt, '<p id="flag-privacy-notice" style="margin:0 0 12px;color:var(--variant);font-size:.72rem;line-height:1.4;text-align:center;">Signed-in flags include your name, user ID, and email in the correction sheet. Signed-out flags are anonymous.</p>' + prompt);
  quiz = quiz.replace('id="flag-button"', 'id="flag-button" aria-describedby="flag-privacy-notice"');
  await writeFile(quizFile, quiz);
}

const endpointFile = 'netlify/functions/report-question-flag.js';
let endpoint = await readFile(endpointFile, 'utf8');
if (!endpoint.includes('import { flagIdentity }')) {
  function patch(from, to) {
    if (!endpoint.includes(from)) throw new Error('Flag endpoint structure changed: ' + from);
    endpoint = endpoint.replaceAll(from, to);
  }
  endpoint = 'import { flagIdentity } from "./flag-identity.js";\n' + endpoint;
  patch('"Status"\n];', '"Status",\n  "Flagged by",\n  "User ID",\n  "Email"\n];');
  patch('"Access-Control-Allow-Headers": "Content-Type"', '"Access-Control-Allow-Headers": "Content-Type, Authorization"');
  patch('if (existing.data.values && existing.data.values.length) return;', `if (existing.data.values && existing.data.values.length) {
    const extra = await sheets.spreadsheets.values.get({ spreadsheetId, range: SHEET_NAME + '!H1:J1' });
    const actual = extra.data.values?.[0] || [];
    const expected = HEADER_ROW.slice(7);
    if (actual.some((value, index) => value && value !== expected[index])) throw new Error('Columns H-J are occupied; review sheet schema.');
    await sheets.spreadsheets.values.update({ spreadsheetId, range: SHEET_NAME + '!H1:J1', valueInputOption: 'RAW', requestBody: { values: [expected] } });
    return;
  }`);
  patch('A1:G1', 'A1:J1');
  patch('range: ' + '`${SHEET_NAME}!A:G`', 'range: ' + '`${SHEET_NAME}!A:J`');
  patch('valueInputOption: "USER_ENTERED"', 'valueInputOption: "RAW"');
  patch('const unitId = cleanText(body.unitId, 80);', `if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid request body.' }, 400);
  let reporter;
  try { reporter = await flagIdentity(req); }
  catch { return json({ error: 'Unable to verify report identity. Please retry.' }, 401); }

  const unitId = cleanText(body.unitId, 80);`);
  patch('"English-to-Arabic" : "Arabic-to-English"', '"English-to-Arabic" : body.mode === "written-answer" ? "Written answer" : "Arabic-to-English"');
  patch('correctAnswer, "New"]]', 'correctAnswer, "New", ...reporter]]');
  patch('Unable to append anonymous word flag:', 'Unable to append word flag:');
  await writeFile(endpointFile, endpoint);
}

const docsFile = 'arabic/docs/features/content-quality-control.md';
let docs = await readFile(docsFile, 'utf8');
if (!docs.includes('## Account attribution update')) {
  docs = docs.replace('There is no signed-in/anonymous identity field — every report is anonymous.', 'Signed-in reports include backend-verified display name, Firebase UID, and email; signed-out reports remain anonymous. See the account attribution update below.');
  docs += '\n\n## Account attribution update\n\nThe deployed build now adds account attribution and correct retry feedback. This supersedes earlier anonymous-only descriptions and the noted snackbar discrepancy. See `features/flag-attribution.md` for the columns, identity verification, retry behavior, and deployment checks.\n';
  await writeFile(docsFile, docs);
}
console.log('Prepared verified flag attribution, sheet columns, privacy notice, and retry handling.');
