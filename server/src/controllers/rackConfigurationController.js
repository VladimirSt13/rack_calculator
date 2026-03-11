import * as rackConfigurationService from '../services/rackConfigurationService.js';

/**
 * POST /api/rack-configurations/find-or-create
 * Знайти або створити конфігурацію стелажа
 */
export const findOrCreateConfiguration = async (req, res, next) => {
  try {
    const config = req.body;

    const result = await rackConfigurationService.findOrCreateConfigurationWithPrices(config, req.user);

    res.json(result);
  } catch (error) {
    if (error.message === 'Price data not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * GET /api/rack-configurations/:id
 * Отримати конфігурацію за ID
 */
export const getConfigurationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const config = await rackConfigurationService.getConfigurationById(id);

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ configuration: config });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rack-configurations/:id/calculate-prices
 * Розрахувати ціни для конфігурації з актуального прайсу
 */
export const calculatePricesForConfiguration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const result = await rackConfigurationService.calculatePricesForConfiguration(id, req.user, quantity);

    res.json({
      ...result,
      calculated_at: new Date().toISOString(),
    });
  } catch (error) {
    if (error.message === 'Configuration not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Price data not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export default {
  findOrCreateConfiguration,
  getConfigurationById,
  calculatePricesForConfiguration,
};
