import {
  APP_VERSION,
  getProfile,
  saveProfile,
  resetProfile,
  isProfileComplete,
  getEvolutionEntries,
  saveEvolutionEntry,
  deleteEvolutionEntry
} from './storage.js';
import { calculateNutrition } from './engine/nutri-engine.js';
import { generateWeeklyPlan } from './meals/generator.js';
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
  result: null,
  mealPlan: null,
  foods: { foods: [], validated: [], quarantined: [], status: 'loading' }
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function goalSignature(profile) {
  return `${profile.goal}|${profile.target}|${profile.deadline}`;
}

function ensureGoalStartDate() {
  const signature = goalSignature(state.profile);
  if (state.profile._goalSignature !== signature) {
    state.profile._goalSignature = signature;
    state.profile._goalStartDate = todayISO();
    state.profile = saveProfile(state.profile);
  } else if (!state.profile._goalStartDate) {
    state.profile._goalStartDate = todayISO();
    state.profile = saveProfile(state.profile);
  }
}

function calculationStartDate() {
  const iso = state.profile._goalStartDate || todayISO();
  return new Date(`${iso}T12:00:00`);
}

function recalculate() {
  if (!isProfileComplete(state.profile)) {
    state.result = null;
    state.mealPlan = null;
    return;
  }
  ensureGoalStartDate();
  state.result = calculateNutrition(state.profile, calculationStartDate());
  state.mealPlan = generateWeeklyPlan(state.profile);
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
}

function renderResultsScreen() {
  recalculate();
  renderResult($('resultBox'), state.result);
}

function renderDashboardScreen() {
  recalculate();
  renderDashboard($('dashboardBox'), state.profile, state.result);
  $('dashboardActions').hidden = !isProfileComplete(state.profile);
  $('dashboardStart').hidden = isProfileComplete(state.profile);
}

function renderMenuScreen() {
  recalculate();
  if (!state.mealPlan) {
    $('menuBox').innerHTML = '<div class="card"><p>Complete a avaliação para organizar o cardápio.</p></div>';
    return;
  }
  renderMealPlan({
    tabs: $('dayTabs'),
    container: $('menuBox'),
    plan: state.mealPlan,
    selectedDay: state.menuDay,
    targetKcal: state.result?.target?.kcal
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
  if ($('foods').classList.contains('is-active')) renderFoodsScreen();
}

document.addEventListener('click', event => {
  const nav = event.target.closest('[data-nav]');
  if (nav) {
    go(nav.dataset.nav);
    return;
  }

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'start-assessment' || action === 'edit-assessment') {
    state.step = 1;
    go('assessment');
    return;
  }
  if (action === 'show-results') {
    go('result');
    return;
  }
  if (action === 'show-menu') {
    go('menu');
    return;
  }
  if (action === 'reset-profile') {
    if (window.confirm('Refazer a avaliação? O histórico de evolução será mantido.')) {
      resetProfile();
      state.profile = getProfile();
      state.step = 1;
      state.result = null;
      state.mealPlan = null;
      go('welcome');
      showToast('Avaliação reiniciada.');
    }
    return;
  }

  const choice = event.target.closest('[data-choice-key]');
  if (choice) {
    state.profile = collectAssessment($('assessmentBox'), state.profile);
    state.profile[choice.dataset.choiceKey] = choice.dataset.choiceValue;
    state.profile = saveProfile(state.profile);
    renderAssessmentScreen();
    return;
  }

  const day = event.target.closest('[data-menu-day]');
  if (day) {
    state.menuDay = Math.max(0, Math.min(6, Number(day.dataset.menuDay) || 0));
    renderMenuScreen();
    return;
  }

  const remove = event.target.closest('[data-delete-evolution]');
  if (remove) {
    deleteEvolutionEntry(remove.dataset.deleteEvolution);
    renderEvolutionScreen();
  }
});

$('assessmentNext').addEventListener('click', () => {
  persistCurrentAssessmentFields();
  const error = validateAssessmentStep(state.step, state.profile);
  if (error) {
    window.alert(error);
    return;
  }
  if (state.step < 5) {
    state.step += 1;
    renderAssessmentScreen();
    window.scrollTo(0, 0);
  } else {
    recalculate();
    go('result');
  }
});

$('assessmentBack').addEventListener('click', () => {
  persistCurrentAssessmentFields();
  if (state.step > 1) state.step -= 1;
  renderAssessmentScreen();
  window.scrollTo(0, 0);
});

$('foodSearch').addEventListener('input', renderFoodsScreen);

$('evolutionForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  saveEvolutionEntry({
    date: form.get('date'),
    weight: form.get('weight'),
    waist: form.get('waist'),
    hip: form.get('hip'),
    notes: form.get('notes')
  });
  event.currentTarget.reset();
  $('evolutionDate').value = todayISO();
  renderEvolutionScreen();
  showToast('Registro de evolução salvo.');
});

$('refreshMenu').addEventListener('click', () => {
  state.mealPlan = generateWeeklyPlan(state.profile, new Date(Date.now() + 7 * 86400000));
  state.menuDay = 0;
  renderMenuScreen();
  showToast('Nova rotação de refeições gerada.');
});

$('appVersion').textContent = `V${APP_VERSION}`;

recalculate();
renderAssessmentScreen();
initFoods();

const requestedScreen = new URLSearchParams(window.location.search).get('screen');
const allowedScreens = new Set(['dashboard', 'menu', 'foods', 'evolution', 'result', 'assessment']);
const initialScreen = allowedScreens.has(requestedScreen)
  ? requestedScreen
  : (isProfileComplete(state.profile) ? 'dashboard' : 'welcome');
go(initialScreen);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
