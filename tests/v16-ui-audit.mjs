import { spawn, execFileSync } from 'node:child_process';

const BASE_URL = process.env.NUTRITOUCH_TEST_URL || 'http://127.0.0.1:4173/';
const observations = [];

function record(screen, check, pass, detail = '') {
  observations.push({ screen, check, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FINDING'} | ${screen} | ${check}${detail ? ` | ${detail}` : ''}`);
}

function findChrome() {
  for (const candidate of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try {
      const path = execFileSync('which', [candidate], { encoding: 'utf8' }).trim();
      if (path) return path;
    } catch {}
  }
  throw new Error('Chrome/Chromium not found on runner');
}

const chrome = findChrome();
const chromeProcess = spawn(chrome, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  '--remote-debugging-port=9222', 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function getPageSocket() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const pages = await fetch('http://127.0.0.1:9222/json/list').then(r => r.json());
      if (pages[0]?.webSocketDebuggerUrl) return pages[0].webSocketDebuggerUrl;
    } catch {}
    await sleep(100);
  }
  throw new Error('Could not connect to Chrome DevTools');
}

const ws = new WebSocket(await getPageSocket());
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let messageId = 0;
const pending = new Map();
const events = new Map();

ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const entry = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(message.error.message));
    else entry.resolve(message.result);
    return;
  }
  const queue = events.get(message.method);
  if (queue?.length) queue.shift()(message.params);
};

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function waitEvent(method, timeout = 6000) {
  return new Promise((resolve, reject) => {
    const queue = events.get(method) || [];
    queue.push(resolve);
    events.set(method, queue);
    setTimeout(() => reject(new Error(`Timeout waiting for ${method}`)), timeout);
  });
}

async function evaluate(expression, awaitPromise = false) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Evaluation failed');
  return result.result.value;
}

async function waitFor(expression, timeout = 6000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { if (await evaluate(expression, true)) return true; } catch {}
    await sleep(80);
  }
  return false;
}

async function navigate(url) {
  const loaded = waitEvent('Page.loadEventFired').catch(() => null);
  await send('Page.navigate', { url });
  await loaded;
  await waitFor(`document.readyState === 'complete'`);
  await sleep(250);
}

async function click(selector) {
  return evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return false; e.click(); return true; })()`);
}

async function setValue(selector, value) {
  return evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return false; e.value=${JSON.stringify(String(value))}; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
}

await send('Page.enable');
await send('Runtime.enable');

try {
  await navigate(BASE_URL);
  await evaluate(`localStorage.clear(); location.reload();`);
  await waitFor(`document.querySelector('#welcome.is-active')`);

  record('Boas-vindas', 'abre como tela inicial em perfil novo', await evaluate(`!!document.querySelector('#welcome.is-active')`));
  record('Boas-vindas', 'botão Começar avaliação existe', await evaluate(`!!document.querySelector('[data-action="start-assessment"]')`));

  await click('[data-action="start-assessment"]');
  record('Avaliação', 'abre etapa 1', await waitFor(`document.querySelector('#assessment.is-active') && document.querySelector('#stepLabel')?.textContent.includes('1 DE 5')`));

  await setValue('[data-field="age"]', 43);
  await setValue('[data-field="weight"]', 60);
  await setValue('[data-field="height"]', 159);
  await click('#assessmentNext');
  record('Avaliação', 'avança da etapa 1 para 2', await waitFor(`document.querySelector('#stepLabel')?.textContent.includes('2 DE 5')`));

  await click('[data-nav="dashboard"]');
  const partialReady = await evaluate(`document.querySelector('#dashboardBox')?.textContent.includes('Seu perfil está pronto')`);
  record('Avaliação', 'não deveria considerar avaliação parcial como concluída', !partialReady, partialReady ? 'Após apenas idade/peso/altura o painel já trata o perfil como pronto.' : 'Perfil parcial permanece incompleto.');

  await click('[data-action="edit-assessment"]');
  await waitFor(`document.querySelector('#stepLabel')?.textContent.includes('1 DE 5')`);
  await click('#assessmentNext');
  await waitFor(`document.querySelector('#stepLabel')?.textContent.includes('2 DE 5')`);
  await click('[data-choice-value="loss"]');
  await setValue('[data-field="target"]', 58);
  await setValue('[data-field="deadline"]', 3);
  await click('#assessmentNext');
  await waitFor(`document.querySelector('#stepLabel')?.textContent.includes('3 DE 5')`);
  await click('#assessmentNext');
  await waitFor(`document.querySelector('#stepLabel')?.textContent.includes('4 DE 5')`);
  await click('#assessmentNext');
  await waitFor(`document.querySelector('#stepLabel')?.textContent.includes('5 DE 5')`);
  await click('#assessmentNext');
  record('Resultado', 'abre após etapa 5', await waitFor(`document.querySelector('#result.is-active')`));
  record('Resultado', 'exibe fluxo gasto → ajuste → meta', await evaluate(`document.querySelector('#resultBox')?.textContent.includes('Gasto estimado') && document.querySelector('#resultBox')?.textContent.includes('Ajuste aplicado') && document.querySelector('#resultBox')?.textContent.includes('Meta energética')`));
  record('Resultado', 'exibe data-alvo real', await evaluate(`document.querySelector('#resultBox')?.textContent.includes('Data-alvo') && document.querySelector('#resultBox')?.textContent.includes('Dias reais de calendário')`));

  await click('[data-nav="dashboard"]');
  const dashboardText = await evaluate(`document.querySelector('#dashboardBox')?.textContent || ''`);
  record('Início', 'painel exibe resumo calculado', dashboardText.includes('Meta energética estimada'));
  record('Início', 'objetivo deveria aparecer traduzido para o usuário', !/\bloss\b|\brecomp\b|\bgain\b|\bmaintenance\b/.test(dashboardText), dashboardText.includes('loss') ? 'O painel exibe o valor interno "loss".' : '');

  await click('[data-nav="menu"]');
  await waitFor(`document.querySelector('#menu.is-active') && document.querySelectorAll('.day-tab').length===7`);
  record('Cardápio', 'renderiza 7 abas de dias', await evaluate(`document.querySelectorAll('.day-tab').length===7`));
  record('Cardápio', 'renderiza refeições sem kcal por refeição', await evaluate(`!document.querySelector('#menuBox')?.textContent.match(/\b\d+\s*kcal\b.*estrutura de refeição/i)`));
  const menuBefore = await evaluate(`document.querySelector('#menuBox')?.innerText || ''`);
  await click('#refreshMenu');
  await sleep(150);
  const menuAfter = await evaluate(`document.querySelector('#menuBox')?.innerText || ''`);
  record('Cardápio', 'Gerar outra rotação altera o cardápio', menuBefore !== menuAfter, menuBefore === menuAfter ? 'O botão informa nova rotação, mas o conteúdo permanece igual.' : '');

  const duplicateSixMeals = await evaluate(`(async()=>{const {generateWeeklyPlan}=await import('./js/meals/generator.js'); const p=JSON.parse(localStorage.getItem('nutritouch_profile')); p.meals='6'; const w=generateWeeklyPlan(p,new Date(2026,8,11,12)); return w.some(d=>d.meals.length===6 && d.meals[1].meal.id===d.meals[5].meal.id);})()`, true);
  record('Cardápio', '6 refeições não repetem lanche da manhã e ceia automaticamente', !duplicateSixMeals, duplicateSixMeals ? 'Com os pools atuais, lanche da manhã e ceia repetem em pelo menos um dia.' : '');

  const fructoseStillFruit = await evaluate(`(async()=>{const {generateWeeklyPlan}=await import('./js/meals/generator.js'); const p=JSON.parse(localStorage.getItem('nutritouch_profile')); p.intolerance='fructose'; const w=generateWeeklyPlan(p,new Date(2026,8,11,12)); return w.some(d=>d.meals.some(x=>/fruta|banana|mamão/i.test(x.meal.title+' '+x.meal.components.join(' '))));})()`, true);
  record('Cardápio', 'intolerância à frutose é respeitada pelo filtro', !fructoseStillFruit, fructoseStillFruit ? 'A opção existe na avaliação, mas o filtro do gerador não trata frutose.' : '');

  await click('[data-nav="foods"]');
  await waitFor(`document.querySelector('#foods.is-active') && !document.querySelector('#foodDbStatus')?.textContent.includes('Carregando')`);
  const foodStatus = await evaluate(`document.querySelector('#foodDbStatus')?.textContent || ''`);
  record('Alimentos', 'base carrega e sinaliza quarentena', foodStatus.includes('quarentena'));
  record('Alimentos', 'não libera registro sem nutrientes validados para cálculo', foodStatus.includes('0 validado'));

  await click('[data-nav="evolution"]');
  await waitFor(`document.querySelector('#evolution.is-active')`);
  record('Evolução', 'data padrão é preenchida', Boolean(await evaluate(`document.querySelector('#evolutionDate')?.value`)));
  await evaluate(`document.querySelector('#evolutionForm').requestSubmit()`);
  await sleep(100);
  const blankHistory = await evaluate(`document.querySelector('#evolutionHistory')?.textContent || ''`);
  record('Evolução', 'não deveria salvar registro totalmente vazio', !blankHistory.includes('Peso') || !blankHistory.includes('—'), blankHistory.includes('—') ? 'É possível salvar apenas a data, gerando medidas vazias.' : '');

  const swRegistered = await evaluate(`navigator.serviceWorker.getRegistration().then(Boolean)`, true);
  record('PWA', 'service worker registra em localhost', swRegistered);

  console.log('\nAUDIT_SUMMARY=' + JSON.stringify(observations));
} finally {
  try { ws.close(); } catch {}
  chromeProcess.kill('SIGTERM');
}
