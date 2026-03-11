import * as priceService from '../services/priceService.js';
import { formatPriceComponents } from '../services/priceComponentsService.js';

/**
 * GET /api/price/components
 * Отримати список комплектуючих з прайсу
 */
export const getPriceComponents = async (req, res, next) => {
  try {
    const user = req.user;

    // Отримати актуальний прайс
    const price = await priceService.getPrice();

    if (!price) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    // Форматування комплектуючих
    const components = formatPriceComponents(price.data);

    res.json({
      components,
      updatedAt: price.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
