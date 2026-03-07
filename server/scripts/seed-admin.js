/**
 * Seed скрипт для створення master адміна та тестових користувачів
 * 
 * Використання:
 *   node scripts/seed-admin.js
 */

import bcrypt from 'bcryptjs';
import { getDb, closeDatabase } from '../src/db/index.js';

const MASTER_ADMIN = {
  email: 'admin@vs.com',
  password: 'P@ssw0rd13',
  role: 'admin',
};

const SECOND_ADMIN = {
  email: 'V.Stognij@accu-energo.com.ua',
  password: 'P@ssw0rd13',
  role: 'admin',
};

const TEST_USERS = [
  {
    email: 'manager@test.com',
    password: '123456',
    role: 'manager',
    permissions: { price_types: ['нульова'] },
  },
  {
    email: 'user@test.com',
    password: '123456',
    role: 'user',
    permissions: { price_types: [] },
  },
];

async function seedAdmins() {
  try {
    const db = await getDb();
    
    // Перевірка чи master адмін вже існує
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(MASTER_ADMIN.email);
    
    if (existingAdmin) {
      console.log('[Seed] Master admin already exists:', MASTER_ADMIN.email);
    } else {
      // Створення master адміна
      const passwordHash = await bcrypt.hash(MASTER_ADMIN.password, 12);
      
      db.prepare(`
        INSERT INTO users (email, password_hash, role, email_verified, permissions)
        VALUES (?, ?, ?, 1, ?)
      `).run(
        MASTER_ADMIN.email,
        passwordHash,
        MASTER_ADMIN.role,
        JSON.stringify({ price_types: ['без_ізоляторів', 'загальна', 'нульова', 'собівартість', 'оптова'] })
      );
      
      console.log('[Seed] ✓ Master admin created:', MASTER_ADMIN.email);
      console.log('[Seed]   Password:', MASTER_ADMIN.password);
    }
    
    // Перевірка чи другий адмін вже існує
    const existingSecondAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(SECOND_ADMIN.email);
    
    if (existingSecondAdmin) {
      console.log('[Seed] Second admin already exists:', SECOND_ADMIN.email);
    } else {
      // Створення другого адміна
      const passwordHash = await bcrypt.hash(SECOND_ADMIN.password, 12);
      
      db.prepare(`
        INSERT INTO users (email, password_hash, role, email_verified, permissions)
        VALUES (?, ?, ?, 1, ?)
      `).run(
        SECOND_ADMIN.email,
        passwordHash,
        SECOND_ADMIN.role,
        JSON.stringify({ price_types: ['без_ізоляторів', 'загальна', 'нульова', 'собівартість', 'оптова'] })
      );
      
      console.log('[Seed] ✓ Second admin created:', SECOND_ADMIN.email);
      console.log('[Seed]   Password:', SECOND_ADMIN.password);
    }
    
    // Створення тестових користувачів
    for (const testUser of TEST_USERS) {
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(testUser.email);
      
      if (existingUser) {
        console.log('[Seed] ✓ Test user already exists:', testUser.email);
      } else {
        const passwordHash = await bcrypt.hash(testUser.password, 12);
        
        db.prepare(`
          INSERT INTO users (email, password_hash, role, email_verified, permissions)
          VALUES (?, ?, ?, 1, ?)
        `).run(
          testUser.email,
          passwordHash,
          testUser.role,
          JSON.stringify(testUser.permissions)
        );
        
        console.log(`[Seed] ✓ Test user created: ${testUser.email} (${testUser.role})`);
        console.log(`[Seed]   Password: ${testUser.password}`);
      }
    }
    
    // Вивід списку всіх користувачів
    const users = db.prepare('SELECT id, email, role, email_verified FROM users').all();
    console.log('\n[Seed] All users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) ${user.email_verified ? '✓' : '✗'}`);
    });
    
  } catch (error) {
    console.error('[Seed] Error:', error);
    process.exit(1);
  } finally {
    closeDatabase();
    process.exit(0);
  }
}

seedAdmins();
