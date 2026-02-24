// js/app/core/PageContext.js

/**
 * @typedef {Object} FeatureContext
 * @property {import('./createState.js').StateInstance<any>} state
 * @property {Record<string, Function>} actions
 * @property {Record<string, Function>} selectors
 * @property {(callback: (s: any) => void) => () => void} subscribe
 */

/**
 * @typedef {Object} PageContextConfig
 * @property {Record<string, FeatureContext>} features - мапа фич: { form, spans, results, set }
 * @property {(inputData: Record<string, any>) => any} calculator - pure function: дані → результат
 * @property {(feature: string, result: any) => void} renderResult - effect: результат → DOM
 * @property {(changes: { feature: string, changes: any }) => boolean} needsRecalculation - чи треба рахувати
 * @property {Function} [onError] - обробник помилок розрахунку
 */

/**
 * @typedef {Object} PageContext
 * @property {() => void} init - підписатися на зміни фич, запустити оркестрацію
 * @property {() => void} destroy - відписатися, очистити ресурси
 * @property {(feature: string, changes: any) => void} handleFeatureChange - ручний тригер зміни
 * @property {() => Record<string, any>} collectInputData - зібрати дані з усіх фич для розрахунку
 */

/**
 * Creates page orchestrator that coordinates features, calculation, and rendering
 * @param {PageContextConfig} config
 * @returns {PageContext}
 */
export const createPageContext = ({
  features,
  calculator,
  renderResult,
  needsRecalculation,
  onError,
  recalculationDelay = 0,
}) => {
  let recalcTimeout = null;
  /** @type {(() => void)[]} */
  const unsubscribes = [];

  /**
   * Collect current data from all features for calculation
   * @returns {Record<string, any>}
   */
  const collectInputData = () => {
    const data = {};
    for (const [name, ctx] of Object.entries(features)) {
      // Використовуємо getData якщо є, інакше беремо весь стан
      data[name] = ctx.selectors.getData?.() ?? ctx.state.get();
    }
    return data;
  };

  const handleFeatureChange = (featureName, changes) => {
    if (recalculationDelay > 0) {
      clearTimeout(recalcTimeout);
      recalcTimeout = setTimeout(() => {
        performRecalculation(featureName, changes);
      }, recalculationDelay);
      return;
    }

    performRecalculation(featureName, changes);
  };

  const performRecalculation = (featureName, changes) => {
    try {
      if (!needsRecalculation({ feature: featureName, changes })) {
        return;
      }

      const inputData = collectInputData();
      const result = calculator(inputData);

      if (result) {
        renderResult(featureName, result);
      }
    } catch (error) {
      console.error(`[PageContext] Error handling ${featureName} change:`, error);
      onError?.(error, { feature: featureName, changes });
    }
  };

  /**
   * Initialize: subscribe to all features
   */
  const init = () => {
    // Підписуємося на зміни кожної фичі
    for (const [name, ctx] of Object.entries(features)) {
      if (typeof ctx.subscribe === 'function') {
        const unsubscribe = ctx.subscribe((newState) => {
          handleFeatureChange(name, newState);
        });
        if (typeof unsubscribe === 'function') {
          unsubscribes.push(unsubscribe);
        }
      }
    }
  };

  /**
   * Destroy: cleanup all subscriptions
   */
  const destroy = () => {
    unsubscribes.forEach((unsub) => unsub?.());
    unsubscribes.length = 0;
  };

  return Object.freeze({
    init,
    destroy,
    handleFeatureChange,
    collectInputData,
  });
};

export default createPageContext;
