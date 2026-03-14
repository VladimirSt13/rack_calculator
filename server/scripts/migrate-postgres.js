/**
 * PostgreSQL Migration Script (Supabase)
 *
 * Використовується для створення схеми БД на PostgreSQL
 * Запуск: npm run migrate:postgres
 */

import { initDatabase, getPool, closeDatabase } from "../src/db/index.js";
import dotenv from "dotenv";

dotenv.config();

const createTables = async (pool) => {
  console.log("[Postgres Migrations] Creating tables...");

  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'other' CHECK (role IN ('admin', 'manager', 'other')),
      permissions JSONB,
      email_verified BOOLEAN DEFAULT false,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("[Postgres Migrations] Created users table");

  // Refresh tokens table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("[Postgres Migrations] Created refresh_tokens table");

  // Email verifications table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("[Postgres Migrations] Created email_verifications table");

  // Password resets table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("[Postgres Migrations] Created password_resets table");

  // Calculations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calculations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT,
      data JSONB NOT NULL,
      type TEXT CHECK (type IN ('rack', 'battery')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("[Postgres Migrations] Created calculations table");

  // Prices table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prices (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("[Postgres Migrations] Created prices table");

  // Rack sets table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rack_sets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      object_name TEXT,
      description TEXT,
      racks JSONB NOT NULL,
      total_cost REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("[Postgres Migrations] Created rack_sets table");

  // Rack set revisions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rack_set_revisions (
      id SERIAL PRIMARY KEY,
      rack_set_id INTEGER NOT NULL REFERENCES rack_sets(id) ON DELETE CASCADE,
      revision_number INTEGER NOT NULL,
      racks JSONB NOT NULL,
      total_cost REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (rack_set_id, revision_number)
    )
  `);
  console.log("[Postgres Migrations] Created rack_set_revisions table");

  // Audit log table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity TEXT,
      entity_id INTEGER,
      old_value JSONB,
      new_value JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log("[Postgres Migrations] Created audit_log table");

  // Roles & permissions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roles_permissions (
      id SERIAL PRIMARY KEY,
      role_name TEXT NOT NULL UNIQUE,
      permissions JSONB NOT NULL,
      price_types JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("[Postgres Migrations] Created roles_permissions table");

  // Rack configurations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rack_configurations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      configuration JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("[Postgres Migrations] Created rack_configurations table");

  // Create indexes
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_calculations_type ON calculations(type)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_rack_sets_user_id ON rack_sets(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_rack_sets_created_at ON rack_sets(created_at)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity)`);
  console.log("[Postgres Migrations] Created indexes");

  console.log("[Postgres Migrations] Tables created successfully");
};

const seedDefaultData = async (pool) => {
  console.log("[Postgres Migrations] Seeding default data...");

  // Seed default roles
  const rolesResult = await pool.query("SELECT COUNT(*) FROM roles_permissions");
  if (parseInt(rolesResult.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO roles_permissions (role_name, permissions, price_types)
      VALUES
        ('admin', '{"users": ["read", "write", "delete"], "roles": ["read", "write", "delete"], "rack_sets": ["read", "write", "delete"], "calculations": ["read", "write", "delete"], "prices": ["read", "write", "delete"], "audit": ["read"]}'::jsonb, '["retail", "wholesale", "custom"]'::jsonb),
        ('manager', '{"users": ["read"], "roles": [], "rack_sets": ["read", "write"], "calculations": ["read", "write"], "prices": ["read"], "audit": []}'::jsonb, '["retail"]'::jsonb),
        ('user', '{"users": [], "roles": [], "rack_sets": [], "calculations": [], "prices": [], "audit": []}'::jsonb, '[]'::jsonb)
    `);
    console.log("[Postgres Migrations] Seeded roles_permissions");
  }

  console.log("[Postgres Migrations] Default data seeded");
};

const runMigrations = async () => {
  try {
    console.log("[Postgres Migrations] Starting migrations...");

    // Ініціалізуємо БД
    await initDatabase(true);
    const pool = await getPool();

    // Створюємо таблиці
    await createTables(pool);

    // Сідемо дані
    await seedDefaultData(pool);

    console.log("[Postgres Migrations] ✓ All migrations completed successfully");
  } catch (error) {
    console.error("[Postgres Migrations] Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await closeDatabase();
    console.log("[Postgres Migrations] Database connection closed");
  }
};

runMigrations();

export default runMigrations;
