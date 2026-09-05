/* NutriTouch — cardápio semanal V1.2
   Estrutura: 7 dias, alimentos in natura/minimamente processados,
   prato 1/2 vegetais + 1/4 proteína + 1/4 carboidrato integral,
   cálculo aproximado por porção e validações de segurança.
*/
(function(){
  const PHOTO={
    chicken:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=82',
    fish:'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=82',
    bowl:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82',
    breakfast:'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=82',
    meal:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=82',
    prep:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=82'
  };

  const DAYS=[
    {name:'Segunda',photo:PHOTO.chicken,meals:[['Café da manhã',[['Aveia em flocos',45],['Banana',90],['Iogurte sem lactose',170],['Castanha de caju',10]]], 'Cremoso de aveia com banana e castanhas'],['Almoço',[['Peito de frango cozido',120],['Arroz integral cozido',90],['Feijão cozido',90],['Brócolis cozido',100],['Tomate',80],['Azeite de oliva',5]],'Frango grelhado, arroz, feijão e salada'],['Lanche',[['Maçã',130],['Castanha de caju',15]],'Maçã crocante com castanhas'],['Jantar',[['Ovo inteiro',120],['Batata cozida',150],['Brócolis cozido',120],['Tomate',80],['Azeite de oliva',5]],'Omelete de legumes com batata']]},
    {name:'Terça',photo:PHOTO.fish,meals:[['Café da manhã',[['Pão integral',70],['Ovo inteiro',100],['Tomate',70],['Banana',80]],'Pão integral com ovos e tomate'],['Almoço',[['Peito de frango cozido',110],['Batata cozida',170],['Feijão cozido',70],['Brócolis cozido',120],['Tomate',80],['Azeite de oliva',5]],'Frango, batata e feijão com muitos vegetais'],['Lanche',[['Iogurte sem lactose',170],['Aveia em flocos',25],['Maçã',100]],'Iogurte com aveia e maçã'],['Jantar',[['Ovo inteiro',100],['Arroz integral cozido',90],['Feijão cozido',70],['Brócolis cozido',130],['Tomate',80],['Azeite de oliva',5]],'Arroz, feijão e ovos com legumes']]},
    {name:'Quarta',photo:PHOTO.bowl,meals:[['Café da manhã',[['Tapioca',60],['Ovo inteiro',100],['Tomate',70],['Abacate',50]],'Tapioca com ovos, tomate e abacate'],['Almoço',[['Peito de frango cozido',100],['Arroz integral cozido',100],['Feijão cozido',80],['Brócolis cozido',100],['Tomate',80],['Azeite de oliva',5]],'Bowl brasileiro de frango e feijão'],['Lanche',[['Banana',100],['Iogurte sem lactose',170],['Castanha de caju',10]],'Banana com iogurte e castanhas'],['Jantar',[['Ovo inteiro',120],['Batata cozida',130],['Brócolis cozido',130],['Tomate',90],['Azeite de oliva',5]],'Ovos com batata rústica e vegetais']]},
    {name:'Quinta',photo:PHOTO.meal,meals:[['Café da manhã',[['Aveia em flocos',45],['Leite sem lactose',200],['Banana',90],['Castanha de caju',10]],'Mingau de aveia com banana e castanhas'],['Almoço',[['Peito de frango cozido',120],['Batata cozida',150],['Feijão cozido',70],['Brócolis cozido',120],['Tomate',70],['Azeite de oliva',5]],'Frango, batata e feijão com salada'],['Lanche',[['Maçã',130],['Iogurte sem lactose',120]],'Maçã com iogurte'],['Jantar',[['Ovo inteiro',100],['Arroz integral cozido',90],['Feijão cozido',80],['Brócolis cozido',130],['Tomate',80],['Azeite de oliva',5]],'Prato brasileiro com ovos e legumes']]},
    {name:'Sexta',photo:PHOTO.prep,meals:[['Café da manhã',[['Pão integral',70],['Queijo minas',35],['Ovo inteiro',50],['Tomate',70],['Maçã',100]],'Pão integral com queijo, ovo e fruta'],['Almoço',[['Peito de frango cozido',110],['Arroz integral cozido',100],['Feijão cozido',80],['Brócolis cozido',100],['Tomate',90],['Azeite de oliva',5]],'Frango com arroz, feijão e salada colorida'],['Lanche',[['Banana',100],['Castanha de caju',15]],'Banana com castanhas'],['Jantar',[['Ovo inteiro',120],['Batata cozida',150],['Brócolis cozido',120],['Tomate',80],['Abacate',40]],'Prato de ovos, batata, vegetais e abacate']]},
    {name:'Sábado',photo:PHOTO.bowl,meals:[['Café da manhã',[['Tapioca',60],['Ovo inteiro',100],['Banana',80],['Iogurte sem lactose',100]],'Tapioca com ovos, banana e iogurte'],['Almoço',[['Peito de frango cozido',120],['Arroz integral cozido',90],['Feijão cozido',90],['Brócolis cozido',110],['Tomate',80],['Azeite de oliva',5]],'Almoço brasileiro equilibrado'],['Lanche',[['Maçã',130],['Castanha de caju',15]],'Maçã e castanhas'],['Jantar',[['Ovo inteiro',100],['Batata cozida',150],['Feijão cozido',70],['Brócolis cozido',130],['Tomate',80],['Azeite de oliva',5]],'Ovos com batata, feijão e vegetais']]},
    {name:'Domingo',photo:PHOTO.meal,meals:[['Café da manhã',[['Aveia em flocos',40],['Iogurte sem lactose',170],['Banana',90],['Castanha de caju',12]],'Tigela de aveia, iogurte, banana e castanhas'],['Almoço',[['Peito de frango cozido',130],['Batata cozida',160],['Feijão cozido',70],['Brócolis cozido',120],['Tomate',80],['Azeite de oliva',5]],'Frango assado com batata, feijão e salada'],['Lanche',[['Iogurte sem lactose',170],['Maçã',100]],'Iogurte e maçã'],['Jantar',[['Ovo inteiro',120],['Arroz integral cozido',90],['Feijão cozido',70],['Brócolis cozido',130],['Tomate',80],['Azeite de oliva',5]],'Arroz, feijão, ovos e legumes']]}
  ];

  const META={
    'Aveia em flocos':{fiber:10.1,sodium:2},'Ovo inteiro':{fiber:0,sodium:142},'Peito de frango cozido':{fiber:0,sodium:74},'Arroz integral cozido':{fiber:2.7,sodium:1},'Feijão cozido':{fiber:8.5,sodium:2},'Banana':{fiber:2.6,sodium:1},'Abacate':{fiber:6.7,sodium:7},'Azeite de oliva':{fiber:0,sodium:0},'Iogurte sem lactose':{fiber:0,sodium:45},'Batata cozida':{fiber:1.8,sodium:3},'Pão integral':{fiber:6.9,sodium:450},'Queijo minas':{fiber:0,sodium:450},'Leite sem lactose':{fiber:0,sodium:45},'Maçã':{fiber:2.4,sodium:1},'Brócolis cozido':{fiber:3.3,sodium:33},'Tomate':{fiber:1.2,sodium:5},'Castanha de caju':{fiber:3.7,sodium:12},'Tapioca':{fiber:0.2,sodium:2}
  };

  const index={}; (window.F||[]).forEach(x=>index[x[0]]={kcal:x[2],p:x[3],c:x[4],f:x[5]});
  function nutrition(items){
    const n={kcal:0,p:0,c:0,f:0,fiber:0,sodium:0};
    items.forEach(([name,g])=>{const x=index[name],m=META[name]||{};if(!x)return;n.kcal+=x.kcal*g/100;n.p+=x.p*g/100;n.c+=x.c*g/100;n.f+=x.f*g/100;n.fiber+=(m.fiber||0)*g/100;n.sodium+=(m.sodium||0)*g/100});
    return n;
  }
  function profileTarget(){
    const age=+d.age||0,w=+d.weight||0,h=+d.height||0;
    if(!age||!w||!h)return {kcal:2000,protein:90,bmi:0};
    const bmi=w/((h/100)**2); const sex=String(d.sex||'').toLowerCase();
    const rmr=10*w+6.25*h-5*age+(sex.includes('fem')||sex==='f'?-161:5);
    const factors={sedentary:1.2,light:1.35,moderate:1.5,'very active':1.65,veryactive:1.65,extreme:1.8};
    const af=factors[String(d.activity||'moderate').toLowerCase()]||1.5;
    const tdee=rmr*af; let kcal=tdee;
    const goal=String(d.goal||'').toLowerCase();
    if(goal.includes('emag'))kcal=tdee*.90; else if(goal.includes('recomp')||goal.includes('recom'))kcal=tdee*.95; else if(goal.includes('ganho'))kcal=tdee*1.05;
    const protein=(String(d.resistance||'').toLowerCase().startsWith('s')?1.8:1.4)*w;
    return {kcal:Math.round(kcal),protein:Math.round(protein),bmi};
  }
  function safeContext(){
    const text=String(d.condition||'').toLowerCase();
    return {diabetes:/diab|glicem/.test(text),hypertension:/hipert|press[aã]o/.test(text),pregnancy:/gest|gravidez/.test(text),elderly:(+d.age||0)>=60};
  }
  function dietaryFilter(meal){
    const pref=(String(d.preferences||'')+' '+String(d.avoid||'')).toLowerCase();
    const allergy=String(d.allergies||'').toLowerCase();
    if(/vegana/.test(pref)) return meal.filter(([n])=>!['Ovo inteiro','Peito de frango cozido','Iogurte sem lactose','Queijo minas','Leite sem lactose'].includes(n));
    if(/vegetar/.test(pref)) return meal.filter(([n])=>!['Peito de frango cozido'].includes(n));
    if(/sem lactose|lactose/.test(pref+ ' '+String(d.intolerance||'').toLowerCase())) return meal.filter(([n])=>!['Iogurte sem lactose','Queijo minas','Leite sem lactose'].includes(n));
    if(/castanha|oleagin/.test(allergy)) return meal.filter(([n])=>n!=='Castanha de caju');
    return meal;
  }
  function adjustMeal(items,target){
    let filtered=dietaryFilter(items); if(!filtered.length)filtered=items;
    let n=nutrition(filtered); const factor=Math.max(.70,Math.min(1.30,target/Math.max(1,n.kcal)));
    return filtered.map(([name,g])=>[name,Math.round(g*factor/5)*5]);
  }
  function contextWarning(ctx){
    const w=[];
    if(ctx.diabetes)w.push('Diabetes: o app prioriza carboidratos ricos em fibras e minimamente processados; metas de carboidratos e medicação precisam de individualização profissional.');
    if(ctx.hypertension)w.push('Hipertensão: o cardápio prioriza alimentos pouco processados e baixo sódio; evite adicionar sal e condimentos ricos em sódio.');
    if(ctx.elderly)w.push('60+: atenção especial à proteína, hidratação e adequação energética; a prescrição individual deve considerar avaliação clínica.');
    if(ctx.pregnancy)w.push('Gestação: o NutriTouch não gera plano individualizado automaticamente. Procure acompanhamento pré-natal e nutricional.');
    return w;
  }
  function renderMenu7(){
    const target=profileTarget(),ctx=safeContext(),nMeals=Math.min(5,Math.max(3,+d.meals||4));
    const shares=nMeals===3?[.25,.40,.35]:nMeals===5?[.18,.27,.12,.18,.25]:[.22,.30,.18,.30];
    const baseDay=DAYS[(window.day||1)-1]||DAYS[0];
    document.getElementById('menuIntro').innerHTML='<strong>7 dias • '+target.kcal+' kcal/dia</strong><br>Variedade de alimentos in natura ou minimamente processados, com vegetais presentes nas principais refeições.';
    document.getElementById('dayTabs').innerHTML=DAYS.map((x,i)=>`<button class="tab ${i+1===(window.day||1)?'active':''}" onclick="window.day=${i+1};window.renderMenu7()">${x.name.slice(0,3)}</button>`).join('');
    const warning=contextWarning(ctx);
    let html=`<div class="weekly-hero"><img src="${baseDay.photo}" alt="Refeição saudável"><div><b>${baseDay.name}</b><span>${target.kcal} kcal planejadas</span></div></div>`;
    if(warning.length)html+=warning.map(x=>`<div class="alert warn">${x}</div>`).join('');
    html+='<div class="plate-rule"><b>Como montamos o prato</b><span>½ vegetais • ¼ proteína • ¼ carboidrato integral/leguminosa</span><small>O método é uma referência visual de composição; as porções são ajustadas às necessidades energéticas e proteicas calculadas.</small></div>';
    baseDay.meals.slice(0,nMeals).forEach((m,i)=>{
      let items=adjustMeal(m[1],target*shares[i]); let nn=nutrition(items);
      const veg=items.filter(([n])=>['Brócolis cozido','Tomate'].includes(n));
      const carb=items.filter(([n])=>['Arroz integral cozido','Batata cozida','Aveia em flocos','Pão integral','Tapioca','Feijão cozido','Banana','Maçã'].includes(n));
      const prot=items.filter(([n])=>['Peito de frango cozido','Ovo inteiro','Iogurte sem lactose','Queijo minas','Leite sem lactose'].includes(n));
      html+=`<article class="meal photo-meal"><div class="meal-image"><img src="${baseDay.photo}" alt="${m[2]}"></div><div class="mealbody"><div class="mealhead"><div><div class="mealname">${m[0]}</div><div class="mealtitle">${m[2]}</div></div><span class="badge">${Math.round(nn.kcal)} kcal</span></div><div class="food-list">${items.map(([n,g])=>`<div><span>${n}</span><b>${g} g</b></div>`).join('')}</div><div class="nutri-line">Proteína ${Math.round(nn.p)}g • Carboidratos ${Math.round(nn.c)}g • Gorduras ${Math.round(nn.f)}g • Fibras ${Math.round(nn.fiber)}g</div><div class="plate-tags"><span>½ vegetais</span><span>¼ proteína</span><span>¼ carboidrato</span></div></div></article>`;
    });
    const all=baseDay.meals.slice(0,nMeals).flatMap((m,i)=>adjustMeal(m[1],target*shares[i])); const total=nutrition(all);
    html+=`<div class="card weekly-total"><h3>Resumo do dia</h3><div class="kpis"><div class="kpi"><span>Energia</span><b>${Math.round(total.kcal)} kcal</b></div><div class="kpi"><span>Proteína</span><b>${Math.round(total.p)} g</b></div><div class="kpi"><span>Fibras</span><b>${Math.round(total.fiber)} g</b></div><div class="kpi"><span>Sódio</span><b>${Math.round(total.sodium)} mg*</b></div></div><p class="small">*Sódio é estimado com os alimentos da base; sal adicionado e marcas podem alterar o valor. A composição nutricional deve ser validada em base oficial antes de uso clínico/comercial.</p></div>`;
    document.getElementById('menuBox').innerHTML=html;
  }
  window.renderMenu7=renderMenu7;
  window.generateMenu=renderMenu7;
  window.day=window.day||1;
  const style=document.createElement('style');style.textContent=`
    .weekly-hero{border-radius:24px;overflow:hidden;background:#fff;border:1px solid var(--l);box-shadow:0 10px 28px #164B3612;margin:12px 0 16px}.weekly-hero img{width:100%;height:190px;object-fit:cover;display:block}.weekly-hero div{padding:14px 16px;display:flex;justify-content:space-between;gap:10px;align-items:center}.weekly-hero b{font-size:20px;color:var(--b)}.weekly-hero span{font-size:12px;color:var(--m)}
    .plate-rule{background:#EAF6EE;border:1px solid #CFE5D5;border-radius:18px;padding:14px;margin:12px 0}.plate-rule b{display:block;color:var(--b);font-size:15px}.plate-rule span{display:block;color:var(--g);font-weight:800;margin-top:5px}.plate-rule small{display:block;color:var(--m);line-height:1.4;margin-top:5px}
    .photo-meal{padding:0;overflow:hidden}.meal-image{height:130px;background:#e9f3eb}.meal-image img{width:100%;height:100%;object-fit:cover;display:block}.mealbody{padding:15px}.mealtitle{font-size:14px;color:var(--m);margin-top:3px}.food-list{margin:12px 0;border-top:1px solid var(--l)}.food-list div{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid #EDF2EE;font-size:12px}.food-list b{color:var(--b)}.nutri-line{font-size:11px;color:var(--m);line-height:1.5}.plate-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.plate-tags span{font-size:10px;font-weight:800;color:var(--g);background:#EAF7EF;border-radius:99px;padding:5px 8px}.weekly-total{margin-top:16px}
  `;document.head.appendChild(style);
})();
