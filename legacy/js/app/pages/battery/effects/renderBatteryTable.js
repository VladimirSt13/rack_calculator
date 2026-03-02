// js/app/pages/battery/effects/renderBatteryTable.js

/**
 * Допоміжна функція для відмінювання слова "балка"
 * @param {number} count
 * @returns {string}
 */
const beamWord = (count) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'балок';
  }
  if (lastDigit === 1) {
    return 'балка';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'балки';
  }
  return 'балок';
};

/**
 * Генерує HTML рядка для варіанту стелажа
 * @param {Object} params
 * @param {Object} params.rack - конфігурація стелажа { floors, rows, length, width, height, topSpans }
 * @param {number} params.index - індекс варіанту
 * @param {Object} params.price - прайс-лист (не використовується в новому форматі)
 * @returns {string}
 */
export const batteryRackRowTemplate = ({ rack, index, price }) => {
  const amount = Math.min(rack.topSpans?.length ?? 0, 10);

  return (rack.topSpans ?? [])
    .slice(0, amount)
    .map((span, spanIndex) => {
      const spansLength = span.combination.reduce((acc, cur) => acc + cur, 0);
      const rackTypeLeftSide = `L${rack.floors}A${rack.rows}-`;
      const rackTypeRightSide = `/${rack.width}${rack.floors > 1 ? `(${rack.height})` : ''}`;
      const rackType = `${rackTypeLeftSide}${spansLength}${rackTypeRightSide}`;

      // Для першого span додаємо index та rackLength
      const firstRow =
        spanIndex === 0
          ? `
        <td rowspan="${amount}">${index + 1}</td>
        <td rowspan="${amount}" class="text-numeric">${rack.length}</td>
        `
          : '';

      return `
      <tr>
        ${firstRow}
        <td>${rackType}</td>
        <td>${span.combination.join(' + ')} <span class="text-muted">[${span.beams} ${beamWord(span.beams)}]</span></td>
      </tr>`;
    })
    .join('');
};

/**
 * Рендерить таблицю результатів
 * @param {Array<Object>} results - масив результатів
 * @param {HTMLElement} outputEl - елемент output
 * @param {Object} price - прайс-лист
 * @param {Object} effects - EffectRegistry (опціонально)
 */
export const renderBatteryTable = (results, outputEl, price = {}, effects = null) => {
  if (!outputEl) return;

  if (!results || results.length === 0) {
    const emptyHtml = `
      <div class="battery-results__empty">
        <p class="text-muted">Введіть параметри акумулятора та натисніть "Підібрати варіанти"</p>
      </div>
    `;

    // Використовуємо effects якщо доступний, інакше прямо в DOM
    if (effects) {
      effects.setHTML('results', 'output', emptyHtml)();
    } else {
      outputEl.innerHTML = emptyHtml;
    }
    return;
  }

  const tableHtml = `
    <div class="table-container">
      <table class="table battery-results__table" data-js="battery-resultsTable" data-feature="results">
        <thead>
          <tr>
            <th>№</th>
            <th>Розрах. довжина</th>
            <th>Тип</th>
            <th>Варіанти прольотів</th>
          </tr>
        </thead>
        <tbody data-js="battery-resultsBody" data-feature="results">
          ${results.map((rack, index) => batteryRackRowTemplate({ rack, index, price })).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Використовуємо effects якщо доступний, інакше прямо в DOM
  if (effects) {
    effects.setHTML('results', 'output', tableHtml)();
  } else {
    outputEl.innerHTML = tableHtml;
  }

  // Додаємо обробники hover для підсвітки об'єднаних комірок
  initBatteryTableHover(outputEl);
};

/**
 * Ініціалізує hover ефекти для об'єднаних комірок
 * @param {HTMLElement} outputEl
 */
const initBatteryTableHover = (outputEl) => {
  const table = outputEl.querySelector('.battery-results__table');
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tbody tr'));

  // Знаходимо всі комірки з rowspan і групуємо рядки
  const rowspanGroups = [];
  let i = 0;

  while (i < rows.length) {
    const row = rows[i];
    const rowspanCell = row.querySelector('td[rowspan]');

    if (rowspanCell) {
      const rowspan = parseInt(rowspanCell.getAttribute('rowspan'), 10);
      const group = [];

      // Додаємо головний рядок
      group.push({
        row,
        cells: Array.from(row.querySelectorAll('td')),
        isMain: true,
      });

      // Додаємо рядки, які входять у rowspan
      for (let j = 1; j < rowspan; j++) {
        if (i + j < rows.length) {
          const subRow = rows[i + j];
          const subCells = Array.from(subRow.querySelectorAll('td'));

          // Визначаємо, які комірки відносяться до цього рядка
          // (ті, що не є rowspan і знаходяться після першої комірки)
          group.push({
            row: subRow,
            cells: subCells,
            isMain: false,
          });
        }
      }

      rowspanGroups.push(group);
      i += rowspan;
    } else {
      i++;
    }
  }

  // Додаємо обробники hover для кожної групи
  rowspanGroups.forEach((group) => {
    group.forEach((item) => {
      item.row.addEventListener('mouseenter', () => {
        // Підсвічуємо всі комірки в цьому рядку
        item.cells.forEach((cell) => {
          cell.classList.add('is-hovered');
        });

        // Якщо це не головний рядок, підсвічуємо rowspan комірки
        if (!item.isMain) {
          const mainItem = group.find((g) => g.isMain);
          if (mainItem) {
            mainItem.cells.forEach((cell) => {
              if (cell.hasAttribute('rowspan')) {
                cell.classList.add('is-hovered');
              }
            });
          }
        }
      });

      item.row.addEventListener('mouseleave', () => {
        // Знімаємо підсвітку з усіх комірок
        group.forEach((g) => {
          g.cells.forEach((cell) => {
            cell.classList.remove('is-hovered');
          });
        });
      });
    });
  });
};
