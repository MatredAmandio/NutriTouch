import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.NUTRITOUCH_TEST_URL || 'http://127.0.0.1:4173/';
const OUT = 'audit-artifacts';
mkdirSync(OUT, { recursive: true });

const browser = ['google-chrome','google-chrome-stable','chromium','chromium-browser']
  .map(name => { try { return execFileSync('which',[name],{encoding:'utf8'}).trim(); } catch { return ''; } })
  .find(Boolean);
if (!browser) throw new Error('Chrome/Chromium not found');

const proc = spawn(browser,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-extensions',
  '--remote-debugging-port=9333','about:blank'
],{stdio:'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function socketUrl(){
  for(let i=0;i<80;i++){
    try{
      const pages=await fetch('http://127.0.0.1:9333/json/list').then(r=>r.json());
      const page = pages.find(p=>p.type==='page' && !String(p.url||'').startsWith('chrome-extension://'));
      if(page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    }catch{}
    await sleep(75);
  }
  throw new Error('DevTools page target unavailable');
}

const ws = new WebSocket(await socketUrl());
await new Promise((resolve,reject)=>{ ws.onopen=resolve; ws.onerror=reject; });
let seq=0; const pending=new Map();
ws.onmessage=e=>{
  const m=JSON.parse(e.data);
  if(m.id && pending.has(m.id)){
    const p=pending.get(m.id); pending.delete(m.id);
    m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
  }
};
function send(method,params={}){
  return new Promise((resolve,reject)=>{
    const id=++seq; pending.set(id,{resolve,reject});
    ws.send(JSON.stringify({id,method,params}));
  });
}
async function js(expression, awaitPromise=false){
  const r=await send('Runtime.evaluate',{expression,awaitPromise,returnByValue:true});
  if(r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Runtime evaluation failed');
  return r.result.value;
}
async function wait(expr, timeout=5000){
  const start=Date.now();
  while(Date.now()-start<timeout){
    try{ if(await js(expr,true)) return true; }catch{}
    await sleep(60);
  }
  return false;
}
async function navigate(path=''){
  const target = new URL(path, BASE).href;
  await send('Page.navigate',{url:target});
  const expected = JSON.stringify(target);
  if(!await wait(`location.href===${expected} && document.readyState==='complete'`,8000)) {
    const actual = await js('location.href');
    throw new Error(`Page load timeout: expected ${target}, got ${actual}`);
  }
  await wait(`!!document.body`,2000);
  await sleep(220);
}
async function click(sel){
  const ok=await js(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;e.click();return true})()`);
  if(!ok) throw new Error(`Missing clickable: ${sel}`);
}
async function setValue(sel,value){
  const ok=await js(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return false;e.value=${JSON.stringify(String(value))};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
  if(!ok) throw new Error(`Missing field: ${sel}`);
}
async function viewport(width,height){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:2,mobile:true,screenWidth:width,screenHeight:height});
  await sleep(80);
}
async function screenshot(name){
  const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  writeFileSync(`${OUT}/${name}.png`,Buffer.from(r.data,'base64'));
}

const results=[];
function check(screen, viewportName, name, pass, detail=''){
  const row={screen,viewport:viewportName,check:name,pass:Boolean(pass),detail};
  results.push(row);
  console.log(`${row.pass?'PASS':'FINDING'} | ${screen} | ${viewportName} | ${name}${detail?` | ${detail}`:''}`);
}
async function geometryChecks(screen, viewportName){
  const g=await js(`(()=>{
    const active=document.querySelector('.screen.is-active');
    const nav=document.querySelector('.bottom-nav');
    const visible=e=>{if(!e)return false;const s=getComputedStyle(e);const r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&!e.hidden&&r.width>0&&r.height>0};
    const tappables=[...document.querySelectorAll('button,input,select,textarea')].filter(visible).map(e=>({tag:e.tagName,cls:e.className,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,text:(e.textContent||e.getAttribute('placeholder')||'').trim().slice(0,40)}));
    const controls=tappables.filter(x=>['INPUT','SELECT','TEXTAREA'].includes(x.tag));
    const buttons=tappables.filter(x=>x.tag==='BUTTON');
    const navButtons=nav&&visible(nav)?[...nav.querySelectorAll('button')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})):[];
    return {
      width:innerWidth,
      scrollWidth:document.documentElement.scrollWidth,
      activeLeft:active?.getBoundingClientRect().left,
      activeRight:active?.getBoundingClientRect().right,
      navVisible:!!(nav&&visible(nav)),
      navBottom:nav?.getBoundingClientRect().bottom,
      navButtons,
      smallControls:controls.filter(x=>x.h<44),
      smallButtons:buttons.filter(x=>x.h<44 && !String(x.cls).includes('day-tab')),
      dayTabs:[...document.querySelectorAll('.day-tab')].filter(visible).map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})),
      h1Size:active?parseFloat(getComputedStyle(active.querySelector('h1,h2')||active).fontSize):0
    };
  })()`);
  check(screen,viewportName,'sem overflow horizontal',g.scrollWidth<=g.width+1,`scrollWidth=${g.scrollWidth}, viewport=${g.width}`);
  check(screen,viewportName,'campos têm alvo de toque ≥44 px',g.smallControls.length===0,g.smallControls.length?JSON.stringify(g.smallControls):'');
  const criticalSmall=g.smallButtons.filter(x=>!String(x.cls).includes('text-button'));
  check(screen,viewportName,'botões principais têm alvo de toque ≥44 px',criticalSmall.length===0,criticalSmall.length?JSON.stringify(criticalSmall):'');
  if(g.navVisible){
    check(screen,viewportName,'navegação inferior cabe na viewport',g.navButtons.every(x=>x.w>=44&&x.h>=44)&&Math.abs(g.navBottom-(await js('innerHeight')))<2,JSON.stringify(g.navButtons));
  }
  const textSmall=g.smallButtons.filter(x=>String(x.cls).includes('text-button'));
  if(textSmall.length) check(screen,viewportName,'botões de texto têm alvo de toque ≥44 px',false,JSON.stringify(textSmall));
  return g;
}

await send('Page.enable'); await send('Runtime.enable');

try{
  await viewport(360,800);
  await navigate();
  await js('localStorage.clear()');
  await navigate();
  check('Boas-vindas','360×800','abre para perfil novo',await wait(`!!document.querySelector('#welcome.is-active')`));
  check('Boas-vindas','360×800','barra inferior fica oculta',await js(`document.querySelector('.bottom-nav')?.hidden===true`));
  await geometryChecks('Boas-vindas','360×800');
  await screenshot('01-welcome-360x800');

  await click('[data-action="start-assessment"]');
  await wait(`document.querySelector('#stepLabel')?.textContent.includes('1 DE 5')`);
  await geometryChecks('Avaliação etapa 1','360×800');
  await screenshot('02-assessment-step1-360x800');
  await setValue('[data-field="age"]',43); await setValue('[data-field="weight"]',60); await setValue('[data-field="height"]',159); await click('#assessmentNext');
  await wait(`document.querySelector('#stepLabel')?.textContent.includes('2 DE 5')`);
  await click('[data-choice-value="loss"]'); await setValue('[data-field="target"]',58); await setValue('[data-field="deadline"]',3);
  await geometryChecks('Avaliação etapa 2','360×800');
  await screenshot('03-assessment-step2-360x800');
  await click('#assessmentNext'); await wait(`document.querySelector('#stepLabel')?.textContent.includes('3 DE 5')`);
  await setValue('[data-field="trainingFreq"]',5); await setValue('[data-field="trainingMin"]',60); await click('#assessmentNext');
  await wait(`document.querySelector('#stepLabel')?.textContent.includes('4 DE 5')`);
  await geometryChecks('Avaliação etapa 4','360×800');
  await screenshot('04-assessment-step4-360x800');
  await click('#assessmentNext'); await wait(`document.querySelector('#stepLabel')?.textContent.includes('5 DE 5')`); await click('#assessmentNext');
  check('Resultado','360×800','abre após cinco etapas',await wait(`!!document.querySelector('#result.is-active')`));
  check('Resultado','360×800','barra inferior visível após conclusão',await js(`document.querySelector('.bottom-nav')?.hidden===false`));
  await geometryChecks('Resultado','360×800');
  await screenshot('05-result-360x800');

  await click('[data-nav="dashboard"]'); await wait(`!!document.querySelector('#dashboard.is-active')`);
  await geometryChecks('Início','360×800');
  await screenshot('06-dashboard-360x800');

  await click('[data-nav="menu"]'); await wait(`!!document.querySelector('#menu.is-active')`);
  const before=await js(`document.querySelector('#menuBox')?.innerText||''`); await click('#refreshMenu'); await sleep(120); const after=await js(`document.querySelector('#menuBox')?.innerText||''`);
  check('Cardápio','360×800','nova rotação altera conteúdo',before!==after);
  const menuGeom=await geometryChecks('Cardápio','360×800');
  check('Cardápio','360×800','abas de dia têm alvo de toque confortável',menuGeom.dayTabs.length===7&&menuGeom.dayTabs.every(x=>x.h>=40),JSON.stringify(menuGeom.dayTabs));
  await screenshot('07-menu-360x800');

  await click('[data-nav="foods"]'); await wait(`!!document.querySelector('#foods.is-active')`); await wait(`!document.querySelector('#foodDbStatus')?.textContent.includes('Carregando')`);
  await geometryChecks('Alimentos','360×800');
  await screenshot('08-foods-360x800');

  await click('[data-nav="evolution"]'); await wait(`!!document.querySelector('#evolution.is-active')`);
  await geometryChecks('Evolução','360×800');
  await screenshot('09-evolution-360x800');

  await viewport(412,915);
  await sleep(100);
  for(const [screen,selector,name] of [
    ['Início','[data-nav="dashboard"]','10-dashboard-412x915'],
    ['Resultado','[data-action="show-results"]','11-result-412x915'],
    ['Cardápio','[data-nav="menu"]','12-menu-412x915'],
    ['Evolução','[data-nav="evolution"]','13-evolution-412x915']
  ]){
    await click(selector); await sleep(100); await geometryChecks(screen,'412×915'); await screenshot(name);
  }

  const sw=await js(`('serviceWorker' in navigator) ? navigator.serviceWorker.getRegistration().then(Boolean) : false`,true);
  check('PWA','412×915','service worker registrado',sw);
  const manifest=await js(`fetch('./manifest.json').then(r=>r.json()).then(m=>({display:m.display,orientation:m.orientation,icons:m.icons||[],shortcuts:m.shortcuts||[]}))`,true);
  check('PWA','412×915','manifesto tem standalone e portrait-primary',manifest.display==='standalone'&&manifest.orientation==='portrait-primary',JSON.stringify(manifest));
  check('PWA','412×915','manifesto possui ícones 192/512 e maskable',manifest.icons.some(i=>String(i.sizes).includes('192'))&&manifest.icons.some(i=>String(i.sizes).includes('512'))&&manifest.icons.some(i=>String(i.purpose).includes('maskable')),JSON.stringify(manifest.icons));

  const summary={generatedAt:new Date().toISOString(),base:BASE,results,failures:results.filter(x=>!x.pass)};
  writeFileSync(`${OUT}/report.json`,JSON.stringify(summary,null,2));
  writeFileSync(`${OUT}/report.txt`,results.map(r=>`${r.pass?'PASS':'FINDING'} | ${r.screen} | ${r.viewport} | ${r.check}${r.detail?` | ${r.detail}`:''}`).join('\n')+'\n');
  console.log(`AUDIT_TOTAL=${results.length} FINDINGS=${summary.failures.length}`);
}finally{
  try{ws.close();}catch{}
  proc.kill('SIGTERM');
}
