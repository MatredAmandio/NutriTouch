/* NutriTouch V16 — compatibilidade e substituições estruturais.
 * Não calcula equivalência nutricional. Quando nenhuma opção é compatível,
 * o gerador bloqueia a sugestão em vez de ignorar a restrição.
 */

export function mealPlanEligibility(profile) {
  if (profile.intolerance === 'fructose') {
    return {
      allowed: false,
      reason: 'Intolerância à frutose exige avaliação individual de tolerância, porções e combinações. O NutriTouch não gera cardápio automático para este caso.'
    };
  }
  if (profile.intolerance === 'other') {
    return {
      allowed: false,
      reason: 'A intolerância informada não possui regras específicas validadas no gerador atual. Revise o plano com profissional habilitado.'
    };
  }
  return { allowed: true, reason: '' };
}

export function isMealCompatible(meal, profile) {
  const flags = new Set(meal.flags || []);
  const preference = profile.preferences || 'brasileira';

  if (preference === 'vegana' && !flags.has('vegan')) return false;
  if (preference === 'vegetariana' && (flags.has('meat') || flags.has('fish'))) return false;

  const glutenRestricted = preference === 'sem-gluten'
    || profile.intolerance === 'gluten_intolerance'
    || profile.intolerance === 'ncgs';
  if (glutenRestricted && flags.has('gluten')) return false;

  if (profile.intolerance === 'lactose' && flags.has('lactose')) return false;

  const avoid = String(profile.avoid || '').toLowerCase();
  const allergies = String(profile.allergies || '').toLowerCase();
  const searchable = `${meal.title} ${(meal.components || []).join(' ')}`.toLowerCase();
  const terms = `${avoid},${allergies}`
    .split(/[,;]/)
    .map(term => term.trim())
    .filter(term => term.length >= 3);

  return !terms.some(term => searchable.includes(term));
}

export function compatiblePool(pool, profile) {
  return pool.filter(meal => isMealCompatible(meal, profile));
}

export function findSubstitution(meal, pool, profile) {
  if (isMealCompatible(meal, profile)) return meal;
  return compatiblePool(pool, profile).find(candidate => candidate.id !== meal.id) || null;
}
