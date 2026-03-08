import { Router } from 'express';
import * as rackController from '../controllers/rackController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /rack/calculate:
 *   post:
 *     summary: Розрахунок стелажа
 *     tags: [Rack]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RackCalculationRequest'
 *     responses:
 *       200:
 *         description: Успішний розрахунок
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RackCalculationResponse'
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неавторизовано
 */
router.post('/calculate', authenticate, rackController.calculateRack);

/**
 * @swagger
 * /rack/calculate-batch:
 *   post:
 *     summary: Масовий розрахунок стелажів
 *     tags: [Rack]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - racks
 *             properties:
 *               racks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/RackCalculationRequest'
 *     responses:
 *       200:
 *         description: Масовий розрахунок виконано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RackCalculationResponse'
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Неавторизовано
 */
router.post('/calculate-batch', authenticate, rackController.calculateRackBatch);

export default router;
