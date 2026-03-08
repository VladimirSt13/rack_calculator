import { Router } from 'express';
import * as batteryController from '../controllers/batteryController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /battery/calculate:
 *   post:
 *     summary: Розрахунок стелажа по батареї
 *     tags: [Battery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatteryCalculationRequest'
 *     responses:
 *       200:
 *         description: Успішний розрахунок
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BatteryVariant'
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неавторизовано
 */
router.post('/calculate', authenticate, batteryController.calculateBatteryRack);

/**
 * @swagger
 * /battery/find-best:
 *   post:
 *     summary: Підбір найкращого варіанту стелажа по батареї
 *     tags: [Battery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatteryCalculationRequest'
 *     responses:
 *       200:
 *         description: Найкращий варіант підібрано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     variants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BatteryVariant'
 *                     bestMatch:
 *                       type: object
 *                       properties:
 *                         variant:
 *                           $ref: '#/components/schemas/BatteryVariant'
 *                         score:
 *                           type: number
 *                           example: 95
 *                         reasons:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Неавторизовано
 */
router.post('/find-best', authenticate, batteryController.findBestRackForBattery);

export default router;
