import { escapeHTML, formatNumber } from './dom.js';

function sourceLabel(food) {
  const source = (food.sources || []).find(item => item.record_id) || {};
  if (source.source_id === 'USDA_FDC') return `USDA FoodData Central • FDC ${source.record_id}`;
  if (source.source_id === 'TACO_NEPA_UNICAMP') return `TACO 4ª ed. (2011) • registro ${source.record_id}`;
  return `${source.source_id || 'Fonte'} ${source.record_id || ''}`.trim();
}

export function renderFoods(container, database, query = '') {
  const q = String(query || '').trim().toLowerCase();
  const foods = (database?.foods || []).filter(food => {
    const text = `${food.name || ''} ${(food.aliases || []).join(' ')} ${food.group || ''}`.toLowerCase();
    return !q || text.includes(q);
  });

  if (!foods.length) {
    container.innerHTML = '<div class="card"><p>Nenhum alimento encontrado.</p></div>';
    return;
  }

  const groups = [...new Set(foods.map(food => food.group || 'outros'))];
  container.innerHTML = groups.map(group => `
    <section class="food-group">
      <h3 class="food-group-title">${escapeHTML(group)}</h3>
      ${foods.filter(food => (food.group || 'outros') === group).map(food => {
        const validated = (database.validated || []).some(item => item.id === food.id);
        const n = food.nutrition || {};
        return `<article class="food-card">
          <div class="food-card-head">
            <div>
              <strong>${escapeHTML(food.name)}</strong>
              <small>${validated ? 'Dados aptos para cálculo' : 'Nutrientes em quarentena'}</small>
            </div>
            <span class="food-status ${validated ? 'validated' : 'quarantined'}">${validated ? 'Validado' : 'Quarentena'}</span>
          </div>
          ${validated ? `<div class="food-macros">
            <span><b>${formatNumber(n.energy_kcal)}</b> kcal</span>
            <span><b>${formatNumber(n.protein_g, 1)}</b> g proteína</span>
            <span><b>${formatNumber(n.carbohydrate_g, 1)}</b> g carboidrato</span>
            <span><b>${formatNumber(n.fat_g, 1)}</b> g gordura</span>
            <span><b>${formatNumber(n.fiber_g, 1)}</b> g fibra</span>
            <span><b>${formatNumber(n.sodium_mg)}</b> mg sódio</span>
          </div>` : ''}
          <div class="food-source">Base: 100 g • ${escapeHTML(sourceLabel(food))}</div>
        </article>`;
      }).join('')}
    </section>`).join('');
}
