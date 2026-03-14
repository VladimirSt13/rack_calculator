import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import * as rolesController from "../controllers/rolesController.js";

const router = Router();

/**
 * GET /api/roles
 * Отримати всі ролі
 */
router.get(
  "/",
  authenticate,
  authorizeRole("admin"),
  rolesController.getAllRoles,
);

/**
 * GET /api/roles/:name/permissions
 * Отримати дозволи ролі
 */
router.get(
  "/:name/permissions",
  authenticate,
  authorizeRole("admin"),
  rolesController.getRolePermissions,
);

/**
 * PUT /api/roles/:name/permissions
 * Оновити дозволи ролі
 */
router.put(
  "/:name/permissions",
  authenticate,
  authorizeRole("admin"),
  rolesController.updateRolePermissions,
);

/**
 * GET /api/roles/:name/price-types
 * Отримати типи цін ролі
 */
router.get(
  "/:name/price-types",
  authenticate,
  authorizeRole("admin"),
  rolesController.getRolePriceTypes,
);

/**
 * PUT /api/roles/:name/price-types
 * Оновити типи цін ролі
 */
router.put(
  "/:name/price-types",
  authenticate,
  authorizeRole("admin"),
  rolesController.updateRolePriceTypes,
);

/**
 * POST /api/roles
 * Створити нову роль
 */
router.post(
  "/",
  authenticate,
  authorizeRole("admin"),
  rolesController.createRole,
);

export default router;
