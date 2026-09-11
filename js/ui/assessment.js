import { escapeHTML } from './dom.js';

function selected(profile, key, value) {
  return String(profile[key]) === String(value) ? ' selected' : '';
}

function optionCard(profile, key, value, title, description) {
  const active = String(profile[key]) === String(value) ? ' is-selected' : '';
  return `<button type="button" class="option-card${active}" data-choice-key="${key}" data-choice-value="${value}">
    <strong>${title}</strong><span>${description}</span>
  </button>`;
}

export function renderAssessment(container, step, profile) {
  const safe = (key) => escapeHTML(profile[key] ?? '');
  let html = '';

  if (step === 1) {
    html = `<h2>Seus dados</h2>
      <p>Usados para estimar IMC e metabolismo.</p>
      <div class="field-row">
        <label>Idade<input data-field="age" type="number" min="10" max="80" value="${safe('age')}"></label>
        <label>Peso (kg)<input data-field="weight" type="number" min="20" max="350" step="0.1" value="${safe('weight')}"></label>
      </div>
      <label>Altura (cm)<input data-field="height" type="number" min="100" max="230" value="${safe('height')}"></label>
      <label>Sexo para cálculo energético
        <select data-field="sex">
          <option value="female"${selected(profile,'sex','female')}>Feminino</option>
          <option value="male"${selected(profile,'sex','male')}>Masculino</option>
        </select>
      </label>`;
  }

  if (step === 2) {
    html = `<h2>Seu objetivo</h2>
      <div class="option-grid">
        ${optionCard(profile,'goal','recomp','Recomposição corporal','Reduzir gordura preservando ou ganhando massa magra.')}
        ${optionCard(profile,'goal','loss','Emagrecimento','Redução gradual do peso.')}
        ${optionCard(profile,'goal','gain','Ganho de massa','Aumento gradual do peso, priorizando massa magra.')}
        ${optionCard(profile,'goal','maintenance','Manutenção','Manter o peso atual.')}
      </div>
      <label>Treino de força
        <select data-field="resistance">
          <option value="yes"${selected(profile,'resistance','yes')}>Sim</option>
          <option value="no"${selected(profile,'resistance','no')}>Não</option>
        </select>
      </label>
      <div class="field-row">
        <label>Peso-alvo (kg)<input data-field="target" type="number" step="0.1" value="${safe('target')}"></label>
        <label>Prazo em meses<input data-field="deadline" type="number" min="1" step="1" placeholder="Ex.: 3" value="${safe('deadline')}"></label>
      </div>
      <p class="helper">Você continua informando apenas o número de meses. A V16 transforma esse prazo em uma data-alvo real do calendário.</p>`;
  }

  if (step === 3) {
    html = `<h2>Sua rotina de movimento</h2>
      <label>Atividade geral
        <select data-field="activity">
          <option value="sedentary"${selected(profile,'activity','sedentary')}>Sedentário</option>
          <option value="light"${selected(profile,'activity','light')}>Levemente ativo</option>
          <option value="moderate"${selected(profile,'activity','moderate')}>Moderadamente ativo</option>
          <option value="very"${selected(profile,'activity','very')}>Muito ativo</option>
          <option value="extreme"${selected(profile,'activity','extreme')}>Extremamente ativo</option>
        </select>
      </label>
      <div class="field-row">
        <label>Treinos/semana<input data-field="trainingFreq" type="number" min="0" max="7" value="${safe('trainingFreq')}"></label>
        <label>Minutos/treino<input data-field="trainingMin" type="number" min="0" value="${safe('trainingMin')}"></label>
      </div>
      <label>Tipo de treino
        <select data-field="trainingType">
          <option value="resistance"${selected(profile,'trainingType','resistance')}>Força / musculação</option>
          <option value="mixed"${selected(profile,'trainingType','mixed')}>Misto</option>
          <option value="cardio"${selected(profile,'trainingType','cardio')}>Cardio</option>
          <option value="none"${selected(profile,'trainingType','none')}>Nenhum</option>
        </select>
      </label>
      <label>Horário habitual do treino
        <select data-field="trainingTime">
          <option value=""${selected(profile,'trainingTime','')}>Não informar</option>
          <option value="morning"${selected(profile,'trainingTime','morning')}>Manhã</option>
          <option value="afternoon"${selected(profile,'trainingTime','afternoon')}>Tarde</option>
          <option value="evening"${selected(profile,'trainingTime','evening')}>Noite</option>
        </select>
      </label>
      <label>Passos/dia<input data-field="steps" type="number" min="0" value="${safe('steps')}"></label>`;
  }

  if (step === 4) {
    html = `<h2>Como você se alimenta?</h2>
      <label>Refeições por dia
        <select data-field="meals">
          ${[3,4,5,6].map(n => `<option value="${n}"${selected(profile,'meals',n)}>${n}</option>`).join('')}
        </select>
      </label>
      <p class="field-title">Preferências</p>
      <div class="option-grid">
        ${optionCard(profile,'preferences','brasileira','🍚 Brasileira e caseira','Arroz, feijão, frutas, verduras e preparações do dia a dia.')}
        ${optionCard(profile,'preferences','mediterranea','🫒 Mediterrânea','Vegetais, leguminosas, peixes, azeite e grãos.')}
        ${optionCard(profile,'preferences','vegetariana','🥚 Vegetariana','Sem carnes e peixes.')}
        ${optionCard(profile,'preferences','vegana','🌱 Vegana','Sem ingredientes de origem animal.')}
        ${optionCard(profile,'preferences','sem-gluten','🌾 Sem glúten','Prioriza alimentos naturalmente sem glúten.')}
        ${optionCard(profile,'preferences','fitness','🏋️ Fitness e performance','Foco em treino, desempenho e recuperação.')}
        ${optionCard(profile,'preferences','ayurveda','🌿 Inspiração ayurvédica','Inspiração culinária, sem diagnóstico.')}
      </div>
      <label>Alimentos que deseja evitar<input data-field="avoid" value="${safe('avoid')}" placeholder="Separe por vírgulas"></label>
      <label>Alergias alimentares<input data-field="allergies" value="${safe('allergies')}" placeholder="Separe por vírgulas"></label>
      <label>Tempo para cozinhar
        <select data-field="cook">
          <option value="quick"${selected(profile,'cook','quick')}>Pouco</option>
          <option value="moderate"${selected(profile,'cook','moderate')}>Moderado</option>
          <option value="high"${selected(profile,'cook','high')}>Tenho tempo</option>
        </select>
      </label>`;
  }

  if (step === 5) {
    html = `<h2>Saúde e segurança</h2>
      <label>Intolerância ou sensibilidade alimentar
        <select data-field="intolerance">
          <option value="none"${selected(profile,'intolerance','none')}>Nenhuma</option>
          <option value="lactose"${selected(profile,'intolerance','lactose')}>Intolerância à lactose</option>
          <option value="gluten_intolerance"${selected(profile,'intolerance','gluten_intolerance')}>Intolerância ao glúten</option>
          <option value="fructose"${selected(profile,'intolerance','fructose')}>Intolerância à frutose</option>
          <option value="ncgs"${selected(profile,'intolerance','ncgs')}>Sensibilidade ao glúten não celíaca</option>
          <option value="other"${selected(profile,'intolerance','other')}>Outra</option>
        </select>
      </label>
      <label>Condição que exige atenção
        <select data-field="condition">
          <option value=""${selected(profile,'condition','')}>Nenhuma informada</option>
          <option value="diabetes"${selected(profile,'condition','diabetes')}>Diabetes</option>
          <option value="hypertension"${selected(profile,'condition','hypertension')}>Hipertensão</option>
          <option value="pregnancy"${selected(profile,'condition','pregnancy')}>Gestação</option>
          <option value="elderly"${selected(profile,'condition','elderly')}>Idoso(a)</option>
        </select>
      </label>
      <div class="alert warning"><strong>Atenção</strong><br>Condições clínicas, gestação, crescimento, alergias e intolerâncias podem exigir revisão profissional.</div>
      <div class="alert danger"><strong>Urgência</strong><br>Reação alérgica grave ou sintomas intensos exigem atendimento de saúde.</div>`;
  }

  container.innerHTML = html;
}

export function collectAssessment(container, profile) {
  const next = { ...profile };
  container.querySelectorAll('[data-field]').forEach(field => {
    const key = field.dataset.field;
    const numeric = field.type === 'number';
    next[key] = numeric ? (field.value === '' ? '' : Number(field.value)) : field.value;
  });
  return next;
}

export function validateAssessmentStep(step, profile) {
  if (step === 1) {
    if (!Number(profile.age) || !Number(profile.weight) || !Number(profile.height)) {
      return 'Preencha idade, peso e altura para continuar.';
    }
    if (Number(profile.age) < 10 || Number(profile.age) > 80) {
      return 'Nesta versão, a faixa etária suportada é de 10 a 80 anos.';
    }
    if (Number(profile.weight) < 20 || Number(profile.weight) > 350 || Number(profile.height) < 100 || Number(profile.height) > 230) {
      return 'Revise peso e altura informados.';
    }
  }
  return null;
}
