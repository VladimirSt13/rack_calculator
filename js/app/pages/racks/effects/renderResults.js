// js/app/pages/racks/effects/renderResults.js

/**
 * Рендер результатів розрахунку стелажа або скидання до початкового стану
 * @param {import('../core/calculator.js').CalculationResult | null} result
 * @param {import('../../../core/EffectRegistry.js').EffectRegistry} effects
 */
export const renderRackResults = (result, effects) => {
  if (!result) {
    // Скидання до початкового стану
    effects.batch([
      effects.setText('results', 'name', '---'),
      effects.setHTML('results', 'componentsTable', ''),
      effects.setText('results', 'totalPrice', '0.00 ₴'),
      effects.setText('results', 'totalWithoutIsolators', '0.00 ₴'),
      effects.setText('results', 'zeroBase', '0.00 ₴'),
      effects.setState('results', 'componentsTable', 'empty'),
      effects.setState('set', 'addToSetBtn', 'disabled'),
      effects.setAttr('set', 'addToSetBtn', 'disabled', ''),
    ]);
    return;
  }

  // Показ результатів
  effects.batch([
    effects.setText('results', 'name', result.name),
    effects.setHTML('results', 'componentsTable', result.tableHtml),
    effects.setText('results', 'totalPrice', `${result.total.toFixed(2)} ₴`),
    effects.setText(
      'results',
      'totalWithoutIsolators',
      `${result.totalWithoutIsolators.toFixed(2)} ₴`,
    ),
    effects.setText('results', 'zeroBase', `${result.zeroBase.toFixed(2)} ₴`),
    effects.setState('results', 'componentsTable', 'ready'),
    effects.setState('set', 'addToSetBtn', 'ready'),
    effects.setAttr('set', 'addToSetBtn', 'disabled', null),
  ]);
};

export default renderRackResults;
