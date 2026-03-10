import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authenticate, authorizeRole } from '../middleware/auth.js';
import audit from '../helpers/audit.js';

const router = Router();

/**
 * @route GET /api/example
 * @desc Get all examples (not deleted)
 * @access Private
 */
router.get('/', authenticate, (req, res) => {
  try {
    const examples = getDb().prepare(`
      SELECT * FROM example 
      WHERE deleted = 0 
      ORDER BY created_at DESC
    `).all();
    
    res.json(examples);
  } catch (error) {
    console.error('[Example Error]', error);
    res.status(500).json({ error: 'Failed to fetch examples' });
  }
});

/**
 * @route POST /api/example
 * @desc Create new example
 * @access Private
 */
router.post('/', authenticate, (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = getDb().prepare(`
      INSERT INTO example (name, description, user_id)
      VALUES (?, ?, ?)
    `).run(name, description || null, req.user.id);
    
    const example = getDb().prepare('SELECT * FROM example WHERE id = ?').get(result.lastInsertRowid);
    
    // Audit log
    audit.log({
      userId: req.user.id,
      action: 'CREATE',
      entityType: 'example',
      entityId: example.id,
      newValue: example,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.status(201).json(example);
  } catch (error) {
    console.error('[Example Error]', error);
    res.status(500).json({ error: 'Failed to create example' });
  }
});

/**
 * @route GET /api/example/:id
 * @desc Get example by ID
 * @access Private
 */
router.get('/:id', authenticate, (req, res) => {
  try {
    const example = getDb().prepare(`
      SELECT * FROM example 
      WHERE id = ? AND deleted = 0
    `).get(req.params.id);
    
    if (!example) {
      return res.status(404).json({ error: 'Example not found' });
    }
    
    res.json(example);
  } catch (error) {
    console.error('[Example Error]', error);
    res.status(500).json({ error: 'Failed to fetch example' });
  }
});

/**
 * @route PUT /api/example/:id
 * @desc Update example
 * @access Private
 */
router.put('/:id', authenticate, (req, res) => {
  try {
    const { name, description } = req.body;
    
    const oldExample = getDb().prepare('SELECT * FROM example WHERE id = ?').get(req.params.id);
    
    if (!oldExample || oldExample.deleted) {
      return res.status(404).json({ error: 'Example not found' });
    }
    
    getDb().prepare(`
      UPDATE example 
      SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name || oldExample.name, description ?? oldExample.description, req.params.id);
    
    const example = getDb().prepare('SELECT * FROM example WHERE id = ?').get(req.params.id);
    
    // Audit log
    audit.log({
      userId: req.user.id,
      action: 'UPDATE',
      entityType: 'example',
      entityId: example.id,
      oldValue: oldExample,
      newValue: example,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json(example);
  } catch (error) {
    console.error('[Example Error]', error);
    res.status(500).json({ error: 'Failed to update example' });
  }
});

/**
 * @route DELETE /api/example/:id
 * @desc Soft delete example
 * @access Private
 */
router.delete('/:id', authenticate, (req, res) => {
  try {
    const oldExample = getDb().prepare('SELECT * FROM example WHERE id = ?').get(req.params.id);
    
    if (!oldExample || oldExample.deleted) {
      return res.status(404).json({ error: 'Example not found' });
    }
    
    getDb().prepare(`
      UPDATE example 
      SET deleted = 1, deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(req.params.id);
    
    // Audit log
    audit.log({
      userId: req.user.id,
      action: 'DELETE',
      entityType: 'example',
      entityId: req.params.id,
      oldValue: oldExample,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({ message: 'Example deleted successfully' });
  } catch (error) {
    console.error('[Example Error]', error);
    res.status(500).json({ error: 'Failed to delete example' });
  }
});

/**
 * @route GET /api/example/deleted/list
 * @desc Get all deleted examples
 * @access Private (Admin only)
 */
router.get('/deleted/list', authenticate, authorizeRole('admin'), (req, res) => {
  try {
    const examples = getDb().prepare(`
      SELECT * FROM example 
      WHERE deleted = 1 
      ORDER BY deleted_at DESC
    `).all();
    
    res.json(examples);
  } catch (error) {
    console.error('[Example Error]', error);
    res.status(500).json({ error: 'Failed to fetch deleted examples' });
  }
});

/**
 * @route POST /api/example/:id/restore
 * @desc Restore deleted example
 * @access Private (Admin only)
 */
router.post('/:id/restore', authenticate, authorizeRole('admin'), (req, res) => {
  try {
    const example = getDb().prepare('SELECT * FROM example WHERE id = ?').get(req.params.id);
    
    if (!example) {
      return res.status(404).json({ error: 'Example not found' });
    }
    
    if (!example.deleted) {
      return res.status(400).json({ error: 'Example is not deleted' });
    }
    
    getDb().prepare(`
      UPDATE example 
      SET deleted = 0, deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(req.params.id);
    
    const restored = getDb().prepare('SELECT * FROM example WHERE id = ?').get(req.params.id);
    
    // Audit log
    audit.log({
      userId: req.user.id,
      action: 'RESTORE',
      entityType: 'example',
      entityId: restored.id,
      newValue: restored,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    res.json({ message: 'Example restored successfully', example: restored });
  } catch (error) {
    console.error('[Example Error]', error);
    res.status(500).json({ error: 'Failed to restore example' });
  }
});

export default router;
