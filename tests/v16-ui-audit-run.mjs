import { spawn, execFileSync } from 'node:child_process';

const BASE = process.env.NUTRITOUCH_TEST_URL || 'http://127.0.0.1:4173/';
const findings = [];
const chrome = ['google-chrome','google-chrome-stable','chromium','chromium-browser'].map(name=>{try{return execFileSync('which',[name],{encoding:'utf8'}).trim()}catch{return ''}}).find(Boolean);
if (!chrome) throw new Error('Chrome/Chromium not found');
const child = spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9222','about:blank'],{stdio:'ignore'});
const sleep = ms => new Promise(r=>setTimeout(r,ms));

function note(screen, check, pass, detail='') {
  const item={screen,check,pass:Boolean(pass),detail}; findings.push(item);
  console.log(`${pass?'PASS':'FINDING'} | ${screen} | ${check}${detail?` | ${detail}`:''}`);
}

async function socketUrl(){for(let i=0;i<60;i++){try{const p=await fetch('http://127.0.0.1:9222/json/list').then(r=>r.json());if(p[0]?.webSocketDebuggerUrl)return p[0].webSocketDebuggerUrl}catch{}await sleep(100)}throw new Error('DevTools unavailable')}
const ws=new WebSocket(await socketUrl());
await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
let seq=0; const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.j(new Error(m.error.message)):p.r(m.result)}};
const send=(method,params={})=>new Promise((r,j)=>{const id=++seq;pending.set(id,{r,j});ws.send(JSON.stringify({id,method,params}))});
async function js(expression, awaitPromise=false){const r=await send('Runtime.evaluate',{expression,awaitPromise,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text||'JS evaluation failed');return r.result.value}
async function wait(expr,ms=7000){const t=Date.now();while(Date.now()-t<ms){try{if(await js(expr,true))return true}catch{}await sleep(80)}return false}
async function nav(url=BASE){await send('Page.navigate',{url});await wait(`document.readyState==='complete'`);await sleep(300)}
async function click(sel){return js(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;e.click();return true})()`)}
async function value(sel,v){return js(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;e.value=${JSON.stringify(String(v))};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`)}

await send('Page.enable'); await send('Runtime.enable');
try {
  await nav();
  await js(`localStorage.clear()`);
  await nav();
  note('Boas-vindas','perfil novo abre na tela inicial',await wait(`!!document.querySelector('#welcome.is-active')`));
  note('Boas-vindas','botão de início está disponível',await js(`!!document.querySelector('[data-action="start-assessment"]')`));

  await click('[data-action="start-assessment"]');
  note('Avaliação','abre etapa 1',await wait(`document.querySelector('#stepLabel')?.textContent.includes('1 DE 5')`));
  await value('[data-field="age"]',43); await value('[data-field="weight"]',60); await value('[data-field="height"]',159); await click('#assessmentNext');
  note('Avaliação','avança para etapa 2',await wait(`document.querySelector('#stepLabel')?.textContent.includes('2 DE 5')`));
  await click('[data-nav="dashboard"]');
  const partial=await js(`document.querySelector('#dashboardBox')?.textContent.includes('Seu perfil está pronto')`);
  note('Avaliação','avaliação parcial não deve virar perfil pronto',!partial,partial?'Somente etapa 1 já libera perfil como concluído.':'');

  await click('[data-action="edit-assessment"]'); await wait(`document.querySelector('#stepLabel')?.textContent.includes('1 DE 5')`); await click('#assessmentNext'); await wait(`document.querySelector('#stepLabel')?.textContent.includes('2 DE 5')`);
  await click('[data-choice-value="loss"]'); await value('[data-field="target"]',58); await value('[data-field="deadline"]',3); await click('#assessmentNext');
  await wait(`document.querySelector('#stepLabel')?.textContent.includes('3 DE 5')`); await click('#assessmentNext');
  await wait(`document.querySelector('#stepLabel')?.textContent.includes('4 DE 5')`); await click('#assessmentNext');
  await wait(`document.querySelector('#stepLabel')?.textContent.includes('5 DE 5')`); await click('#assessmentNext');
  note('Resultado','abre ao concluir etapa 5',await wait(`!!document.querySelector('#result.is-active')`));
  const resultText=await js(`document.querySelector('#resultBox')?.textContent||''`);
  note('Resultado','exibe gasto → ajuste → meta',resultText.includes('Gasto estimado')&&resultText.includes('Ajuste aplicado')&&resultText.includes('Meta energética'));
  note('Resultado','exibe data-alvo e dias reais',resultText.includes('Data-alvo')&&resultText.includes('Dias reais de calendário'));

  await click('[data-nav="dashboard"]');
  const dash=await js(`document.querySelector('#dashboardBox')?.textContent||''`);
  note('Início','resumo energético aparece',dash.includes('Meta energética estimada'));
  note('Início','objetivo aparece em linguagem de usuário',!/\bloss\b|\brecomp\b|\bgain\b|\bmaintenance\b/.test(dash),/\bloss\b/.test(dash)?'Valor interno "loss" é exibido.':'');

  await click('[data-nav="menu"]'); await wait(`document.querySelectorAll('.day-tab').length===7`);
  note('Cardápio','tem 7 dias',await js(`document.querySelectorAll('.day-tab').length===7`));
  const before=await js(`document.querySelector('#menuBox')?.innerText||''`); await click('#refreshMenu'); await sleep(200); const after=await js(`document.querySelector('#menuBox')?.innerText||''`);
  note('Cardápio','botão nova rotação muda o conteúdo',before!==after,before===after?'O toast muda, mas a rotação é recalculada de volta para a semana atual.':'');
  const dup6=await js(`(async()=>{const m=await import('./js/meals/generator.js');const p=JSON.parse(localStorage.getItem('nutritouch_profile'));p.meals='6';const w=m.generateWeeklyPlan(p,new Date(2026,8,11,12));return w.some(d=>d.meals[1].meal.id===d.meals[5].meal.id)})()`,true);
  note('Cardápio','6 refeições evitam repetir lanche da manhã na ceia',!dup6,dup6?'A rotação de snack repete posições separadas por 4.':'');
  const fructose=await js(`(async()=>{const m=await import('./js/meals/generator.js');const p=JSON.parse(localStorage.getItem('nutritouch_profile'));p.intolerance='fructose';const w=m.generateWeeklyPlan(p,new Date(2026,8,11,12));return w.some(d=>d.meals.some(x=>/fruta|banana|mamão/i.test(x.meal.title+' '+x.meal.components.join(' '))))})()`,true);
  note('Cardápio','filtro respeita intolerância à frutose',!fructose,fructose?'A avaliação oferece frutose, mas substitutions.js não a filtra.':'');

  await click('[data-nav="foods"]'); await wait(`!document.querySelector('#foodDbStatus')?.textContent.includes('Carregando')`);
  const fs=await js(`document.querySelector('#foodDbStatus')?.textContent||''`);
  note('Alimentos','base informa quarentena',fs.includes('quarentena'));
  note('Alimentos','registro sem validação não entra no cálculo',fs.includes('0 validado'));

  await click('[data-nav="evolution"]'); await wait(`!!document.querySelector('#evolution.is-active')`);
  note('Evolução','preenche data padrão',Boolean(await js(`document.querySelector('#evolutionDate')?.value`)));
  await js(`document.querySelector('#evolutionForm').requestSubmit()`); await sleep(150);
  const hist=await js(`document.querySelector('#evolutionHistory')?.textContent||''`);
  note('Evolução','impede registro sem nenhuma medida',!hist.includes('—'),hist.includes('—')?'Só a data já cria um registro com medidas vazias.':'');

  const sw=await js(`navigator.serviceWorker.getRegistration().then(Boolean)`,true);
  note('PWA','service worker registra',sw);
  console.log('AUDIT_SUMMARY='+JSON.stringify(findings));
} finally { try{ws.close()}catch{} child.kill('SIGTERM'); }
