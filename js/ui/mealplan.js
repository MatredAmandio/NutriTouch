import { DAYS } from '../meals/generator.js';
import { escapeHTML, formatNumber } from './dom.js';

const PHOTO_LIBRARY = Object.freeze({
  breakfast: 'https://unsplash.com/photos/nTZOILVZuOg/download?force=true&w=1200',
  yogurt: 'https://unsplash.com/photos/yIh0i6TYGrs/download?force=true&w=1200',
  eggs: 'https://unsplash.com/photos/BbHfeNHKFu0/download?force=true&w=1200',
  omelet: 'https://unsplash.com/photos/agCH0oOENKA/download?force=true&w=1200',
  chicken: 'https://unsplash.com/photos/JvdvggDe-yA/download?force=true&w=1200',
  fish: 'https://unsplash.com/photos/0bcgm13wP48/download?force=true&w=1200',
  tofu: 'https://unsplash.com/photos/-4V4SjHPPDk/download?force=true&w=1200',
  legumes: 'https://unsplash.com/photos/-miW09-lISw/download?force=true&w=1200',
  vegan: 'https://unsplash.com/photos/CULeu3m_tXo/download?force=true&w=1200',
  vegetables: 'https://unsplash.com/photos/lGeAZjIhQyo/download?force=true&w=1200'
});

const DAILY_PHOTOS = Object.freeze([
  PHOTO_LIBRARY.breakfast,
  PHOTO_LIBRARY.yogurt,
  PHOTO_LIBRARY.eggs,
  PHOTO_LIBRARY.omelet,
  PHOTO_LIBRARY.chicken,
  PHOTO_LIBRARY.fish,
  PHOTO_LIBRARY.vegan
]);

function photoForMeal(title = '', components = []) {
  const text = `${title} ${components.join(' ')}`.toLowerCase();
  if (/frango|carne/.test(text)) return PHOTO_LIBRARY.chicken;
  if (/peixe/.test(text)) return PHOTO_LIBRARY.fish;
  if (/tofu/.test(text)) return PHOTO_LIBRARY.tofu;
  if (/lentilha|feijão|grão-de-bico/.test(text)) return PHOTO_LIBRARY.legumes;
  if (/omelete/.test(text)) return PHOTO_LIBRARY.omelet;
  if (/ovo/.test(text)) return PHOTO_LIBRARY.eggs;
  if (/iogurte/.test(text)) return PHOTO_LIBRARY.yogurt;
  if (/aveia|banana|fruta|castanha|semente/.test(text)) return PHOTO_LIBRARY.breakfast;
  if (/vegetal|legume|salada|quinoa|arroz/.test(text)) return PHOTO_LIBRARY.vegan;
  return PHOTO_LIBRARY.vegetables;
}

function mealPhoto(entry, index, selectedDay, featuredIndex) {
  const blocked = (entry.meal.flags || []).includes('blocked');
  if (blocked || index !== featuredIndex) return '';
  const src = DAILY_PHOTOS[selectedDay] || photoForMeal(entry.meal.title, entry.meal.components || []);
  const alt = `Foto ilustrativa de ${entry.meal.title}`;
  return `<figure class="meal-photo-wrap">
    <img class="meal-photo" src="${src}" alt="${escapeHTML(alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.closest('figure').hidden=true">
    <span class="meal-photo-badge">Foto do prato</span>
  </figure>`;
}

function nutrientLine(nutrients) {
  if (!nutrients) return '';
  return `<div class="meal-nutrition" aria-label="Nutrientes calculados da refeição">
    <strong>${formatNumber(nutrients.energy_kcal)} kcal</strong>
    <span>P ${formatNumber(nutrients.protein_g, 1)} g</span>
    <span>C ${formatNumber(nutrients.carbohydrate_g, 1)} g</span>
    <span>G ${formatNumber(nutrients.fat_g, 1)} g</span>
  </div>`;
}

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
  const quantified = day.nutrientStatus === 'validated-food-calculation';
  const daily = day.nutrients;
  const eligiblePhotoIndexes = day.meals
    .map((entry, index) => ((entry.meal.flags || []).includes('blocked') ? -1 : index))
    .filter(index => index >= 0);
  const featuredPhotoIndex = eligiblePhotoIndexes.length
    ? eligiblePhotoIndexes[selectedDay % eligiblePhotoIndexes.length]
    : -1;

  container.innerHTML = `
    <div class="card menu-status">
      <strong>${escapeHTML(day.day)}</strong>
      <p>${quantified
        ? `Porções calculadas a partir de alimentos validados. ${targetKcal ? `Meta do perfil: ${Math.round(targetKcal)} kcal/dia. ` : ''}Total planejado para o dia: ${formatNumber(daily?.energy_kcal || 0)} kcal.`
        : `${targetKcal ? `Meta energética do perfil: ${Math.round(targetKcal)} kcal/dia. ` : ''}Esta rotação ainda é estrutural e não atribui calorias às refeições.`}
      </p>
      <div class="menu-photo-note">As fotos são referências visuais dos pratos indicados e não representam porções exatas.</div>
    </div>
    ${safetyMessage ? `<div class="alert warning"><strong>Atenção às restrições</strong><br>${escapeHTML(safetyMessage)}</div>` : ''}
    ${day.meals.map((entry, index) => {
      const blocked = (entry.meal.flags || []).includes('blocked');
      return `<article class="meal-card${blocked ? ' blocked-meal' : ''}">
        ${mealPhoto(entry, index, selectedDay, featuredPhotoIndex)}
        <div class="meal-body">
          <div class="meal-header">
            <span>${escapeHTML(entry.label)}${entry.role ? ` <b class="meal-role">${escapeHTML(entry.role)}</b>` : ''}</span>
            <small>${blocked ? 'revisão necessária' : (quantified ? 'porções calculadas' : 'estrutura de refeição')}</small>
          </div>
          <h3>${escapeHTML(entry.meal.title)}</h3>
          ${nutrientLine(entry.nutrients)}
          <div class="chips">${entry.meal.components.map(component => `<span>${escapeHTML(component)}</span>`).join('')}</div>
        </div>
      </article>`;
    }).join('')}
    <p class="helper">${quantified
      ? 'Cálculos feitos somente com registros de composição nutricional validados e rastreáveis. Ajustes clínicos continuam fora do escopo do gerador automático.'
      : 'Sem calorias inventadas: cálculos por refeição só aparecem quando todos os ingredientes da receita estão vinculados a registros nutricionais validados.'}
    </p>`;
}
