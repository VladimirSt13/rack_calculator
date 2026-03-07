import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { getUserPermissions, PRICE_TYPES } from '../helpers/roles.js';

const router = Router();

/**
 * GET /api/price/components
 * Отримати список комплектуючих з прайсу
 */
router.get('/components', authenticate, async (req, res, next) => {
  try {
    const db = await getDb();
    const user = req.user;
    const permissions = await getUserPermissions(user);

    // Отримати актуальний прайс
    const priceRecord = db.prepare('SELECT data FROM prices ORDER BY id DESC LIMIT 1').get();

    if (!priceRecord) {
      return res.status(404).json({ error: 'Price data not found' });
    }

    const price = JSON.parse(priceRecord.data);

    // Форматування комплектуючих
    const components = {
      supports: [],
      spans: [],
      verticalSupports: [],
      diagonalBrace: [],
      isolator: [],
    };

    // Опори (supports)
    if (price.supports) {
      components.supports = Object.entries(price.supports).map(([code, data]) => ({
        code,
        name: data.name || `Опора ${code}`,
      }));
    }

    // Балки (spans)
    if (price.spans) {
      components.spans = Object.entries(price.spans).map(([code, data]) => ({
        code,
        name: data.name || `Балка ${code}`,
      }));
    }

    // Вертикальні опори (vertical_supports)
    if (price.vertical_supports) {
      components.verticalSupports = Object.entries(price.vertical_supports).map(([code, data]) => ({
        code,
        name: data.name || `Верт. опора ${code}`,
      }));
    }

    // Розкоси (diagonal_brace)
    if (price.diagonal_brace) {
      components.diagonalBrace = Object.entries(price.diagonal_brace).map(([code, data]) => ({
        code,
        name: data.name || `Розкос ${code}`,
      }));
    }

    // Ізолятори (isolator)
    if (price.isolator) {
      components.isolator = Object.entries(price.isolator).map(([code, data]) => ({
        code,
        name: data.name || `Ізолятор ${code}`,
      }));
    }

    res.json({
      components,
      updatedAt: priceRecord.updated_at,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
