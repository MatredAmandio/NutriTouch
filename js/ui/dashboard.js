import { formatDate, formatNumber } from './dom.js';

const GOAL_LABELS = Object.freeze({
  loss: 'Emagrecimento',
  recomp: 'Recomposição corporal',
  gain: 'Ganho de massa',
  maintenance: 'Manutenção'
});

function safetyClass(level) {
  if (level === 'RED') return 'danger';
  if (level === 'YELLOW') return 'warning';
  return 'success';
}

export function renderResult(container, result) {
  if (!result?.ok) {
    container.innerHTML = `<div class="card"><h3>Não foi possível calcular</h3><p>${result?.error || 'Revise os dados da avaliação.'}</p></div>`;
    return;
  }

  const { anthropometry, metabolism, goal, adjustment, target, macros, references, safety } = result;
  const plan = goal.plan;

  container.innerHTML = `
    <div class="metric-grid">
      <article class="metric"><span>IMC</span><strong>${formatNumber(anthropometry.bmi, 1)}</strong><small>${anthropometry.bmiClass}</small></article>
      <article class="metric"><span>TMB</span><strong>${metabolism.bmrKcal == null ? '—' : formatNumber(metabolism.bmrKcal)}</strong><small>${metabolism.bmrKcal == null ? 'não exibida para menores' : 'kcal/dia'}</small></article>
    </div>

    <div class="flow-card">
      <div><span>Gasto estimado</span><strong>${formatNumber(metabolism.expenditureKcal)} kcal</strong></div>
      <div class="flow-arrow">→</div>
      <div><span>Ajuste aplicado</span><strong>${adjustment.appliedKcal >= 0 ? '+' : ''}${formatNumber(adjustment.appliedKcal)} kcal</strong></div>
      <div class="flow-arrow">→</div>
      <div><span>Meta energética</span><strong>${formatNumber(target.kcal)} kcal</strong></div>
    </div>

    <div class="alert ${safetyClass(safety.level)}">
      <strong>${safety.level} — nível de segurança</strong><br>${safety.reason}
    </div>

    ${plan ? `<div class="card">
      <h3>Prazo e meta</h3>
      <div class="data-row"><b>Prazo originalmente informado</b><span>${plan.months} mês(es)</span></div>
      <div class="data-row"><b>Data-alvo</b><span>${formatDate(plan.targetDate)}</span></div>
      <div class="data-row"><b>Dias restantes</b><span>${plan.days}</span></div>
      <div class="data-row"><b>Peso-alvo</b><span>${formatNumber(plan.target, 1)} kg</span></div>
      <div class="data-row"><b>Variação restante estimada</b><span>${plan.deltaKg > 0 ? '+' : ''}${formatNumber(plan.deltaKg, 1)} kg</span></div>
      ${plan.expired ? '<p class="helper">A data-alvo já passou. Edite a avaliação para definir um novo prazo.</p>' : ''}
      ${adjustment.capped ? '<p class="helper">O ajuste solicitado foi limitado pela camada de segurança da V16.</p>' : ''}
    </div>` : ''}

    <div class="card">
      <h3>Macros de referência</h3>
      <div class="data-row"><b>Proteínas</b><span>≈ ${formatNumber(macros?.protein_g)} g/dia</span></div>
      ${macros?.carbohydrate_g == null ? '' : `<div class="data-row"><b>Carboidratos</b><span>≈ ${formatNumber(macros.carbohydrate_g)} g/dia</span></div>`}
      ${macros?.fat_g == null ? '' : `<div class="data-row"><b>Gorduras</b><span>≈ ${formatNumber(macros.fat_g)} g/dia</span></div>`}
      <div class="data-row"><b>Fibras</b><span>≈ ${formatNumber(references.fiber_g)} g/dia</span></div>
      <div class="data-row"><b>Sódio</b><span>até ≈ ${formatNumber(references.sodium_mg)} mg/dia</span></div>
      <p class="helper">Estimativas iniciais. Não substituem prescrição nutricional ou avaliação clínica individual.</p>
    </div>`;
}

export function renderDashboard(container, profile, result) {
  if (!result?.ok) {
    container.innerHTML = `<div class="card"><h3>Vamos começar?</h3><p>Complete as cinco etapas da avaliação para gerar suas estimativas.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="hero-summary">
      <span>Meta energética estimada</span>
      <strong>${formatNumber(result.target.kcal)} kcal/dia</strong>
      <small>Segurança: ${result.safety.level}</small>
    </div>
    <div class="card">
      <h3>Seu perfil está pronto</h3>
      <p>Use o cardápio como estrutura de refeições e acompanhe sua evolução ao longo do tempo.</p>
      <div class="data-row"><b>Objetivo</b><span>${GOAL_LABELS[profile.goal] || 'Objetivo personalizado'}</span></div>
      <div class="data-row"><b>Refeições/dia</b><span>${profile.meals}</span></div>
    </div>`;
}
