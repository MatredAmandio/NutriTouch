import { escapeHTML, formatNumber } from './dom.js';

export function renderFoods(container, database, query = '') {
  const q = String(query || '').trim().toLowerCase();
  const foods = (database?.foods || []).filter(food => {
    const text = `${food.name || ''} ${(food.aliases || []).join(' ')}`.toLowerCase();
    return !q || text.includes(q);
  });

  if (!foods.length) {
    container.innerHTML = '<div class="card"><p>Nenhum alimento encontrado.</p></div>';
    return;
  }

  container.innerHTML = foods.map(food => {
    const validated = (database.validated || []).some(item => item.id === food.id);
    const n = food.nutrition || {};
    return `<article class="food-row">
      <div>
        <strong>${escapeHTML(food.name)}</strong>
        <small>${validated ? 'Dados nutricionais validados' : 'Identidade disponível • nutrientes em quarentena'}</small>
      </div>
      <div class="food-status ${validated ? 'validated' : 'quarantined'}">
        ${validated ? `${formatNumber(n.energy_kcal)} kcal/100 g` : 'sem cálculo'}
      </div>
    </article>`;
  }).join('');
}
