import { escapeHTML, formatNumber } from './dom.js';

export function renderEvolution(container, entries) {
  if (!entries.length) {
    container.innerHTML = '<div class="card"><h3>Primeiro registro</h3><p>Registre peso e, se quiser, cintura e quadril. O histórico fica salvo neste dispositivo.</p></div>';
    return;
  }

  container.innerHTML = entries.map(entry => `
    <article class="history-card">
      <div class="history-date">${escapeHTML(new Date(`${entry.date}T12:00:00`).toLocaleDateString('pt-BR'))}</div>
      <div class="history-metrics">
        <span><b>${entry.weight == null ? '—' : `${formatNumber(entry.weight, 1)} kg`}</b>Peso</span>
        <span><b>${entry.waist == null ? '—' : `${formatNumber(entry.waist, 1)} cm`}</b>Cintura</span>
        <span><b>${entry.hip == null ? '—' : `${formatNumber(entry.hip, 1)} cm`}</b>Quadril</span>
      </div>
      ${entry.notes ? `<p>${escapeHTML(entry.notes)}</p>` : ''}
      <button type="button" class="text-button danger-text" data-delete-evolution="${escapeHTML(entry.date)}">Excluir</button>
    </article>`).join('');
}
