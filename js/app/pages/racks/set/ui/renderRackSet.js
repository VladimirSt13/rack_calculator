// js/app/pages/racks/set/ui/renderRackSet.js

import { collectComponents } from '../utils/collectComponents.js';

/**
 * Рендер комплекту стелажів
 * @param {Object} options
 * @param {Object} options.actions - екшени комплекту
 * @param {Object} options.selectors - селектори комплекту
 * @param {Object} options.refs - рефи контейнерів { rackSetTable, rackSetSummary }
 * @param {'page' | 'modal'} [options.mode='page'] - режим відображення
 */
export const renderRackSet = ({
  actions,
  selectors,
  refs,
  mode = 'page', // 🔥 'page' або 'modal'
}) => {
  const container = refs.rackSetTable;
  const summary = refs.rackSetSummary;
  const isPage = mode === 'page';
  const isModal = mode === 'modal';

  if (!container || !summary) {
    return;
  }

  const racks = selectors.getAll();

  if (!racks.length) {
    container.innerHTML = '';
    container.summary = `<div class="rack-set-total">
      <strong>Загальна сума:</strong> 
      <span data-testid="rack-set-total">0.00</span>
    </div>
    `;

    return;
  }
  container.innerHTML = '';
  container.summary = '';

  // Заголовки таблиці
  container.innerHTML = `
    <table class="rack-set-table">
      <thead>
        <tr>
          <th>№</th>
          <th>Назва</th>
          ${isPage ? '<th>Кількість</th>' : '<th>Кількість (шт)</th>'}
          <th>Ціна за од.</th>
          <th>Сума</th>
          ${isPage ? '<th></th><th></th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${racks
          .map((item, index) => {
            const rack = item.rack;
            console.log('🚀 ~ rack->', rack);
            const qty = item.qty;
            const unitCost = rack.totalCost || 0;
            const total = unitCost * qty;

            // 🔥 Таблиця комплектуючих (тільки для модалки)
            const componentsHtml =
              isModal && rack.components
                ? (() => {
                    const components = collectComponents(rack.components);
                    if (!components.length) {
                      return '';
                    }

                    return `
                    <tr class="rack-set__components-row">
                      <td colspan="5">
                        <div class="rack-set__components-wrapper">
                          <span class="rack-set__components-label">Комплектація:</span>
                          <table class="rack-set__components-table">
                            <thead>
                              <tr>
                                <th>Компонент</th>
                                <th>На 1 стелаж</th>
                                <th>Загалом</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${components
                                .map(
                                  (c) => `
                                  <tr>
                                    <td>${c.name}</td>
                                    <td>${c.amount}</td>
                                    <td>${c.amount * qty}</td>
                                  </tr>
                                `,
                                )
                                .join('')}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  `;
                  })()
                : '';

            // 🔥 Кнопки дій (тільки для сторінки)
            const actionsHtml = isPage
              ? `
              <td>
                <div class="rack-set__qty-controls">
                  <button type="button" class="btn-qty-decrease" aria-label="Зменшити кількість">−</button>
                  <span class="rack-set__qty-value">${qty}</span>
                  <button type="button" class="btn-qty-increase" aria-label="Збільшити кількість">+</button>
                  <button type="button" class="btn-remove" aria-label="Видалити стелаж">✕</button>
                </div>
              </td>
            `
              : `
              <td>${qty}</td>
            `;

            return `
              <tr class="rack-set__main-row" data-id="${item.id}">
                <td>${index + 1}</td>
                <td>${mode === 'modal' ? `${rack.description} ${rack.abbreviation}` : rack.abbreviation || '—'}</td>
                ${actionsHtml}
                <td>${unitCost.toFixed(2)}</td>
                <td>${total.toFixed(2)}</td>
              </tr>
              ${componentsHtml}
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;

  // Підсумок
  const grandTotal = racks.reduce((sum, r) => sum + (r.rack.totalCost || 0) * r.qty, 0);
  summary.innerHTML = `
    <div class="rack-set-total">
      <strong>Загальна сума:</strong> 
      <span data-testid="rack-set-total">${grandTotal.toFixed(2)}</span>
    </div>
  `;

  // 🔥 Делегування подій (тільки для сторінки)
  if (!isPage) {
    return;
  }

  const tbody = container.querySelector('tbody');
  if (!tbody) {
    return;
  }

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) {
      return;
    }

    const tr = e.target.closest('tr.rack-set__main-row[data-id]');
    if (!tr) {
      return;
    }

    const id = tr.dataset.id;
    const rackItem = racks.find((r) => r.id === id);
    if (!rackItem) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (btn.classList.contains('btn-qty-decrease')) {
      const newQty = rackItem.qty - 1;
      if (newQty <= 0) {
        actions.removeRack(id);
      } else {
        actions.updateQty(id, newQty);
      }
    }

    if (btn.classList.contains('btn-qty-increase')) {
      actions.updateQty(id, rackItem.qty + 1);
    }

    if (btn.classList.contains('btn-remove')) {
      actions.removeRack(id);
    }
  });
};
