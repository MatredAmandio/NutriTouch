import {
  APP_VERSION,
  getProfile,
  saveProfile,
  completeAssessment,
  resetProfile,
  isProfileComplete,
  localDateISO,
  getEvolutionEntries,
  findEvolutionEntry,
  saveEvolutionEntry,
  deleteEvolutionEntry
} from './storage.js';
import { calculateNutrition } from './engine/nutri-engine.js';
import { targetDateForMonths } from './engine/goals.js';
import { generateWeeklyPlan } from './meals/generator.js';
import { generateQuantifiedWeeklyPlan, canGenerateQuantifiedPlan } from './meals/quantified-generator.js';
import { mealPlanEligibility } from './meals/substitutions.js';
import { loadFoodDatabase } from './data/foods.js';
import { $, showToast } from './ui/dom.js';
import { renderAssessment, collectAssessment, validateAssessmentStep } from './ui/assessment.js';
import { renderResult, renderDashboard } from './ui/dashboard.js';
import { renderMealPlan } from './ui/mealplan.js';
import { renderFoods } from './ui/foods.js';
import { renderEvolution } from './ui/evolution.js';

const state = {
  profile: getProfile(),
  step: 1,
  menuDay: 0,
  menuRotation: 0,
  menuBlockReason: '',
  result: null,
  mealPlan: null,
  foods: { foods: [], validated: [], quarantined: [], status: 'loading' }
};

function todayISO() { return localDateISO(); }
function dateAtNoon(iso = todayISO()) { return new Date(`${iso}T12:00:00`); }
function goalSignature(profile) { return `${profile.goal}|${profile.target}|${profile.deadline}`; }

function ensureGoalSchedule() {
  const signature = goalSignature(state.profile);
  const needsDeadline = state.profile.goal !== 'maintenance'
    && Number(state.profile.target) > 0
    && Number(state.profile.deadline) > 0;

  if (!needsDeadline) {
    if (state.profile._goalSignature !== signature || state.profile._goalTargetDate) {
      state.profile = saveProfile({ ...state.profile, _goalSignature: signature, _goalStartDate: todayISO(), _goalTargetDate: '' });
    }
    return;
  }

  if (state.profile._goalSignature !== signature || !state.profile._goalTargetDate) {
    const start = dateAtNoon();
    const target = targetDateForMonths(start, state.profile.deadline);
    state.profile = saveProfile({
      ...state.profile,
      _goalSignature: signature,
      _goalStartDate: todayISO(),
      _goalTargetDate: target ? localDateISO(target) : ''
    });
  }
}

function rotationDate() {
  return new Date(dateAtNoon().getTime() + state.menuRotation * 7 * 86400000);
}

function recalculate() {
  if (!isProfileComplete(state.profile)) {
    state.result = null;
    state.mealPlan = null;
    state.menuBlockReason = '';
    return;
  }

  ensureGoalSchedule();
  state.result = calculateNutrition(state.profile, dateAtNoon());

  const eligibility = mealPlanEligibility(state.profile);
  if (state.result?.safety?.blockAutomaticTarget) {
    state.mealPlan = null;
    state.menuBlockReason = state.result.safety.reason;
    return;
  }
  if (!eligibility.allowed) {
    state.mealPlan = null;
    state.menuBlockReason = eligibility.reason;
    return;
  }

  state.menuBlockReason = '';
  const validatedFoods = state.foods.validated || [];
  const quantified = canGenerateQuantifiedPlan(validatedFoods)
    ? generateQuantifiedWeeklyPlan(state.profile, validatedFoods, state.result?.target?.kcal, rotationDate())
    : null;
  state.mealPlan = quantified || generateWeeklyPlan(state.profile, rotationDate());
}

function setActiveNav(screen) {
  document.querySelectorAll('[data-nav]').forEach(button => {
    button.classList.toggle('is-active', button.dataset.nav === screen);
  });
}

function go(screen) {
  if ((screen === 'menu' || screen === 'result') && !isProfileComplete(state.profile)) {
    state.step = 1;
    screen = 'assessment';
  }

  document.querySelectorAll('.screen').forEach(section => {
    section.classList.toggle('is-active', section.id === screen);
  });
  setActiveNav(screen);

  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) bottomNav.hidden = screen === 'welcome' || screen === 'assessment' || !isProfileComplete(state.profile);

  if (screen === 'assessment') renderAssessmentScreen();
  if (screen === 'result') renderResultsScreen();
  if (screen === 'dashboard') renderDashboardScreen();
  if (screen === 'menu') renderMenuScreen();
  if (screen === 'foods') renderFoodsScreen();
  if (screen === 'evolution') renderEvolutionScreen();
  window.scrollTo(0, 0);
}

function renderAssessmentScreen() {
  const box = $('assessmentBox');
  $('stepLabel').textContent = `ETAPA ${state.step} DE 5`;
  $('progressBar').style.width = `${state.step * 20}%`;
  $('assessmentBack').hidden = state.step === 1;
  $('assessmentNext').textContent = state.step === 5 ? 'Calcular meu plano' : 'Continuar';
  renderAssessment(box, state.step, state.profile);
}

function persistCurrentAssessmentFields() {
  state.profile = collectAssessment($('assessmentBox'), state.profile);
  state.profile = saveProfile(state.profile);
  return state.profile;
}

function renderResultsScreen() { recalculate(); renderResult($('resultBox'), state.result); }

function renderDashboardScreen() {
  recalculate();
  renderDashboard($('dashboardBox'), state.profile, state.result);
  $('dashboardActions').hidden = !isProfileComplete(state.profile);
  $('dashboardStart').hidden = isProfileComplete(state.profile);
  if (!isProfileComplete(state.profile)) $('dashboardStart').textContent = 'Continuar avaliação';
}

function renderMenuScreen() {
  recalculate();
  const tabs = $('dayTabs');
  const box = $('menuBox');

  if (!state.mealPlan) {
    tabs.innerHTML = '';
    box.innerHTML = `<div class="card"><h3>Cardápio automático indisponível</h3><p>${state.menuBlockReason || 'Complete a avaliação para organizar o cardápio.'}</p><p class="helper">O bloqueio é intencional: o aplicativo não ignora alertas clínicos ou intolerâncias sem regra específica.</p></div>`;
    return;
  }

  const hasFoodRestriction = Boolean(String(state.profile.allergies || '').trim())
    || (state.profile.intolerance && state.profile.intolerance !== 'none');
  const restrictionMessage = hasFoodRestriction
    ? 'Confira ingredientes, rótulos e risco de contaminação cruzada. O filtro estrutural não substitui avaliação individual.'
    : '';

  renderMealPlan({
    tabs,
    container: box,
    plan: state.mealPlan,
    selectedDay: state.menuDay,
    targetKcal: state.result?.target?.kcal,
    safetyMessage: restrictionMessage
  });
}

function renderFoodsScreen() {
  const note = $('foodDbStatus');
  const validatedCount = state.foods.validated?.length || 0;
  const quarantineCount = state.foods.quarantined?.length || 0;
  note.innerHTML = `<strong>Base ${state.foods.version || ''}</strong> • ${validatedCount} validado(s) para cálculo • ${quarantineCount} em quarentena.`;
  renderFoods($('foodBox'), state.foods, $('foodSearch')?.value || '');
}

function renderEvolutionScreen() {
  const date = $('evolutionDate');
  if (date && !date.value) date.value = todayISO();
  renderEvolution($('evolutionHistory'), getEvolutionEntries());
}

async function initFoods() {
  state.foods = await loadFoodDatabase();
  recalculate();
  if ($('foods').classList.contains('is-active')) renderFoodsScreen();
  if ($('menu').classList.contains('is-active')) renderMenuScreen();
}

document.addEventListener('click', event => {
  const nav = event.target.closest('[data-nav]');
  if (nav) {
    if ($('assessment').classList.contains('is-active')) persistCurrentAssessmentFields();
    go(nav.dataset.nav); return;
  }

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'start-assessment' || action === 'edit-assessment') { state.step = 1; go('assessment'); return; }
  if (action === 'show-results') { go('result'); return; }
  if (action === 'show-menu') { go('menu'); return; }
  if (action === 'reset-profile') {
    if (window.confirm('Refazer a avaliação? O histórico de evolução será mantido.')) {
      resetProfile(); state.profile = getProfile(); state.step = 1; state.menuRotation = 0;
      state.result = null; state.mealPlan = null; state.menuBlockReason = ''; go('welcome'); showToast('Avaliação reiniciada.');
    }
    return;
  }

  const choice = event.target.closest('[data-choice-key]');
  if (choice) {
    state.profile = collectAssessment($('assessmentBox'), state.profile);
    state.profile[choice.dataset.choiceKey] = choice.dataset.choiceValue;
    if (choice.dataset.choiceKey === 'goal') {
      state.profile._goalSignature = ''; state.profile._goalStartDate = ''; state.profile._goalTargetDate = '';
      if (choice.dataset.choiceValue === 'maintenance') { state.profile.target = ''; state.profile.deadline = ''; }
    }
    state.profile = saveProfile(state.profile); renderAssessmentScreen(); return;
  }

  const day = event.target.closest('[data-menu-day]');
  if (day) { state.menuDay = Math.max(0, Math.min(6, Number(day.dataset.menuDay) || 0)); renderMenuScreen(); return; }

  const remove = event.target.closest('[data-delete-evolution]');
  if (remove && window.confirm('Excluir este registro de evolução?')) {
    deleteEvolutionEntry(remove.dataset.deleteEvolution); renderEvolutionScreen(); showToast('Registro excluído.');
  }
});

$('assessmentNext').addEventListener('click', () => {
  persistCurrentAssessmentFields();
  const error = validateAssessmentStep(state.step, state.profile);
  if (error) { window.alert(error); return; }
  if (state.step < 5) { state.step += 1; renderAssessmentScreen(); window.scrollTo(0, 0); }
  else { state.profile = completeAssessment(state.profile); state.menuRotation = 0; state.menuDay = 0; recalculate(); go('result'); }
});

$('assessmentBack').addEventListener('click', () => {
  persistCurrentAssessmentFields(); if (state.step > 1) state.step -= 1; renderAssessmentScreen(); window.scrollTo(0, 0);
});

$('foodSearch').addEventListener('input', renderFoodsScreen);

$('evolutionForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const draft = { date: form.get('date'), weight: form.get('weight'), waist: form.get('waist'), hip: form.get('hip'), notes: form.get('notes') };
  let saved = saveEvolutionEntry(draft);
  if (saved.code === 'duplicate') {
    const existing = findEvolutionEntry(draft.date);
    if (!window.confirm(existing ? 'Já existe um registro nesta data. Deseja substituí-lo?' : 'Deseja substituir o registro desta data?')) return;
    saved = saveEvolutionEntry(draft, { replace: true });
  }
  if (!saved.ok) { showToast(saved.error || 'Não foi possível salvar o registro.'); return; }
  event.currentTarget.reset(); $('evolutionDate').value = todayISO(); renderEvolutionScreen();
  showToast(saved.replaced ? 'Registro atualizado.' : 'Registro de evolução salvo.');
});

$('refreshMenu').addEventListener('click', () => {
  if (!isProfileComplete(state.profile)) { go('assessment'); return; }
  if (state.menuBlockReason) { showToast('O cardápio automático está bloqueado por segurança.'); return; }
  state.menuRotation += 1; state.menuDay = 0; renderMenuScreen(); showToast('Nova rotação de refeições gerada.');
});

$('appVersion').textContent = `V${APP_VERSION}`;
recalculate(); renderAssessmentScreen(); initFoods();

const requestedScreen = new URLSearchParams(window.location.search).get('screen');
const allowedScreens = new Set(['dashboard', 'menu', 'foods', 'evolution', 'result', 'assessment']);
const initialScreen = allowedScreens.has(requestedScreen) ? requestedScreen : (isProfileComplete(state.profile) ? 'dashboard' : 'welcome');
go(initialScreen);

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
