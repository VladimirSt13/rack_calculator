import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { AuditLog } from "../models/AuditLog.js";
import {
  getUserPermissions,
  getAllRoles,
  updateRolePriceTypes,
} from "../helpers/roles.js";

/**
 * GET /api/users
 * Отримати список користувачів
 */
export const getUsers = async (req, res, next) => {
  try {
    const db = await User.getDb();
    const { role, search, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT u.id, u.email, u.role, u.email_verified, u.created_at,
             r.label as role_label
      FROM users u
      LEFT JOIN roles r ON u.role = r.name
      WHERE 1=1
    `;

    const params = [];

    if (role) {
      query += " AND u.role = ?";
      params.push(role);
    }

    if (search) {
      query += " AND u.email LIKE ?";
      params.push(`%${search}%`);
    }

    query += " ORDER BY u.created_at DESC";
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const users = db.prepare(query).all(...params);

    // Отримати загальну кількість
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      WHERE 1=1
      ${role ? "AND u.role = ?" : ""}
      ${search ? "AND u.email LIKE ?" : ""}
    `;
    const countParams = role
      ? [role, ...(search ? [search] : [])]
      : search
        ? [search]
        : [];
    const total = db.prepare(countQuery).get(...countParams).total;

    // Додати permissions до кожного користувача
    const usersWithPermissions = users.map((user) => ({
      ...user,
      permissions: getUserPermissions(user),
    }));

    res.json({
      users: usersWithPermissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Отримати користувача
 */
export const getUser = async (req, res, next) => {
  try {
    const db = await User.getDb();
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Отримати permissions з БД
    const permissions = getUserPermissions(user);

    // Отримати роль
    const role = await Role.findByName(user.role);

    res.json({
      user: {
        ...user.toSafeObject(),
        permissions,
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users
 * Створити користувача
 */
export const createUser = async (req, res, next) => {
  try {
    const { email, password, role, permissions, price_types } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Перевірка чи користувач вже існує
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Перевірка ролі
    const validRole = await Role.findByName(role || "user");
    if (!validRole) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Хешування пароля
    const passwordHash = await bcrypt.hash(password, 12);

    // Створення користувача
    const user = await User.create({
      email,
      passwordHash,
      role: role || "user",
      permissions,
      emailVerified: true,
    });

    // Якщо вказані price_types, оновити для ролі користувача
    if (price_types && Array.isArray(price_types)) {
      await updateRolePriceTypes(role || "user", price_types);
    }

    // Audit log
    await AuditLog.create({
      userId: req.user.userId,
      action: "create",
      entityType: "user",
      entityId: user.id,
      newValue: { email, role, permissions, price_types },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      message: "User created successfully",
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Оновити користувача
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role, permissions, price_types, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Перевірка ролі
    if (role) {
      const validRole = await Role.findByName(role);
      if (!validRole) {
        return res.status(400).json({ error: "Invalid role" });
      }
    }

    // Підготовка даних для оновлення
    const updateData = {};

    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (password && password.length >= 6) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Оновлення користувача
    await user.update(updateData);

    // Якщо вказані price_types, оновити для ролі
    if (price_types && Array.isArray(price_types) && role) {
      await updateRolePriceTypes(role, price_types);
    }

    // Audit log
    await AuditLog.create({
      userId: req.user.userId,
      action: "update",
      entityType: "user",
      entityId: parseInt(id),
      oldValue: user.toSafeObject(),
      newValue: {
        email,
        role,
        permissions,
        price_types,
        password: password ? "***" : undefined,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      message: "User updated successfully",
      user: {
        id: parseInt(id),
        email: email || user.email,
        role: role || user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Видалити користувача
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Не можна видалити самого себе
    if (user.id === req.user.userId) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    // Видалення
    await User.delete("users", id);

    // Audit log
    await AuditLog.create({
      userId: req.user.userId,
      action: "delete",
      entityType: "user",
      entityId: parseInt(id),
      oldValue: user.toSafeObject(),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/audit
 * Отримати історію аудиту користувача
 */
export const getUserAudit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const audit = await AuditLog.findByEntity("user", parseInt(id));

    res.json({
      audit: audit
        .slice(0, parseInt(limit))
        .map((log) => (log.toDto ? log.toDto() : log)),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserAudit,
};
