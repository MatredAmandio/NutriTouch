import { DAYS } from '../meals/generator.js';
import { escapeHTML } from './dom.js';

export function renderMealPlan({ tabs, container, plan, selectedDay = 0, targetKcal = null, safetyMessage = '' }) {
  if (!Array.isArray(plan) || !plan.length) {
    container.innerHTML = '<div class="card"><p>Cardápio indisponível.</p></div>';
    return;
  }

  tabs.innerHTML = DAYS.map((day, index) => `
    <button type="button" class="day-tab${index === selectedDay ? ' is-active' : ''}" data-menu-day="${index}" aria-pressed="${index === selectedDay}">
      ${day.slice(0, 3)}
    </button>`).join('');

  const day = plan[selectedDay] || plan[0];
  container.innerHTML = `
    <div class="card menu-status">
      <strong>${escapeHTML(day.day)}</strong>
      <p>${targetKcal ? `Meta energética do perfil: ${Math.round(targetKcal)} kcal/dia. ` : ''}O cardápio V16 ainda não atribui calorias às refeições enquanto os ingredientes não estiverem ligados a registros nutricionais validados.</p>
    </div>
    ${safetyMessage ? `<div class="alert warning"><strong>Atenção às restrições</strong><br>${escapeHTML(safetyMessage)}</div>` : ''}
    ${day.meals.map(entry => {
      const blocked = (entry.meal.flags || []).includes('blocked');
      return `<article class="meal-card${blocked ? ' blocked-meal' : ''}">
        <div class="meal-visual" role="img" aria-label="Ilustração de refeição equilibrada"></div>
        <div class="meal-body">
          <div class="meal-header">
            <span>${escapeHTML(entry.label)}${entry.role ? ` <b class="meal-role">${escapeHTML(entry.role)}</b>` : ''}</span>
            <small>${blocked ? 'revisão necessária' : 'estrutura de refeição'}</small>
          </div>
          <h3>${escapeHTML(entry.meal.title)}</h3>
          <div class="chips">${entry.meal.components.map(component => `<span>${escapeHTML(component)}</span>`).join('')}</div>
        </div>
      </article>`;
    }).join('')}
    <p class="helper">Sem calorias inventadas: cálculos por refeição só serão liberados quando a base de alimentos tiver composição e proveniência validadas.</p>`;
}
