import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { getUserPermissions, getAllRoles, updateRolePriceTypes } from '../helpers/roles.js';
import { logAudit, AUDIT_ACTIONS, ENTITY_TYPES } from '../helpers/audit.js';

/**
 * GET /api/users
 * Отримати список користувачів
 */
export const getUsers = async (req, res, next) => {
  try {
    const db = await getDb();
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
      query += ' AND u.role = ?';
      params.push(role);
    }
    
    if (search) {
      query += ' AND u.email LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY u.created_at DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const users = db.prepare(query).all(...params);
    
    // Отримати загальну кількість
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      WHERE 1=1
      ${role ? 'AND u.role = ?' : ''}
      ${search ? 'AND u.email LIKE ?' : ''}
    `;
    const countParams = role ? [role, ...(search ? [search] : [])] : search ? [search] : [];
    const total = db.prepare(countQuery).get(...countParams).total;
    
    // Додати permissions до кожного користувача
    const usersWithPermissions = users.map(user => ({
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
    const db = await getDb();
    const { id } = req.params;
    
    const user = db.prepare(`
      SELECT u.id, u.email, u.role, u.email_verified, u.permissions, u.created_at,
             r.label as role_label, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role = r.name
      WHERE u.id = ?
    `).get(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Отримати permissions з БД
    const permissions = getUserPermissions(user);
    
    // Отримати роль
    const role = db.prepare('SELECT * FROM roles WHERE name = ?').get(user.role);
    
    res.json({
      user: {
        ...user,
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
    const db = await getDb();
    const { email, password, role, permissions, price_types } = req.body;
    
    // Валідація
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Перевірка чи користувач вже існує
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Перевірка ролі
    const validRole = db.prepare('SELECT id FROM roles WHERE name = ?').get(role || 'user');
    if (!validRole) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Хешування пароля
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Створення користувача
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, role, permissions, email_verified)
      VALUES (?, ?, ?, ?, 1)
    `).run(email, passwordHash, role || 'user', permissions ? JSON.stringify(permissions) : null);
    
    const userId = result.lastInsertRowid;
    
    // Якщо вказані price_types, оновити для ролі користувача
    if (price_types && Array.isArray(price_types)) {
      await updateRolePriceTypes(role || 'user', price_types);
    }
    
    // Audit log
    await logAudit({
      userId: req.user.userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: ENTITY_TYPES.USER,
      entityId: userId,
      newValue: { email, role, permissions, price_types },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user: { id: userId, email, role },
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
    const db = await getDb();
    const { id } = req.params;
    const { email, role, permissions, price_types, password } = req.body;
    
    // Перевірка чи користувач існує
    const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Перевірка ролі
    if (role) {
      const validRole = db.prepare('SELECT id FROM roles WHERE name = ?').get(role);
      if (!validRole) {
        return res.status(400).json({ error: 'Invalid role' });
      }
    }
    
    // Оновлення полів
    const updates = [];
    const params = [];
    
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    
    if (permissions) {
      updates.push('permissions = ?');
      params.push(JSON.stringify(permissions));
    }
    
    if (password && password.length >= 6) {
      const passwordHash = await bcrypt.hash(password, 12);
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }
    
    if (updates.length > 0) {
      params.push(id);
      db.prepare(`
        UPDATE users SET ${updates.join(', ')} WHERE id = ?
      `).run(...params);
    }
    
    // Якщо вказані price_types, оновити для ролі
    if (price_types && Array.isArray(price_types) && role) {
      await updateRolePriceTypes(role, price_types);
    }
    
    // Audit log
    await logAudit({
      userId: req.user.userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: ENTITY_TYPES.USER,
      entityId: parseInt(id),
      oldValue: user,
      newValue: { email, role, permissions, price_types, password: password ? '***' : undefined },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({
      message: 'User updated successfully',
      user: { id: parseInt(id), email: email || user.email, role: role || user.role },
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
    const db = await getDb();
    const { id } = req.params;
    
    // Перевірка чи користувач існує
    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Не можна видалити самого себе
    if (user.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    
    // Видалення
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    // Audit log
    await logAudit({
      userId: req.user.userId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: ENTITY_TYPES.USER,
      entityId: parseInt(id),
      oldValue: user,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({ message: 'User deleted successfully' });
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
    const db = await getDb();
    const { id } = req.params;
    const { limit = 50 } = req.query;
    
    const audit = db.prepare(`
      SELECT a.*, u.email as user_email
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = 'user' AND a.entity_id = ?
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(id, parseInt(limit));
    
    res.json({ audit });
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
