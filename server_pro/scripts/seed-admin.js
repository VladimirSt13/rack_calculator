import { initDatabase, getDb } from '../src/db/index.js';
import User from '../src/models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Seed admin user
 */
const seedAdmin = async () => {
  try {
    // Initialize database
    initDatabase();
    const db = getDb();
    
    const adminEmail = 'admin@example.com';
    const adminPassword = 'P@ssw0rd123';
    
    // Check if admin exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
    
    if (existing) {
      console.log('Admin user already exists');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      return;
    }
    
    // Create admin
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    db.prepare(`
      INSERT INTO users (email, password_hash, role, permissions, email_verified)
      VALUES (?, ?, ?, ?, 1)
    `).run(adminEmail, passwordHash, 'admin', JSON.stringify(['*']));
    
    console.log('✅ Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n⚠️  Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
