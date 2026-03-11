import * as priceService from '../services/priceService.js';

/**
 * GET /api/price
 * Отримати поточний прайс-лист
 */
export const getPrice = async (req, res, next) => {
  try {
    const price = await priceService.getPrice();

    if (!price) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    res.json(price);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/price
 * Оновити прайс-лист (auth required)
 */
export const updatePrice = async (req, res, next) => {
  try {
    const { data } = req.body;

    const validationError = priceService.validatePriceData(data);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const price = await priceService.updatePrice(data);

    res.json({
      data: JSON.parse(price.data),
      updatedAt: price.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/price/upload
 * Завантажити прайс з файлу (auth required)
 */
export const uploadPrice = async (req, res, next) => {
  try {
    const { data } = req.body;

    const validationError = priceService.validatePriceData(data);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const price = await priceService.uploadPrice(data);

    res.status(201).json({
      data: JSON.parse(price.data),
      updatedAt: price.updated_at,
    });
  } catch (error) {
    next(error);
  }
};
