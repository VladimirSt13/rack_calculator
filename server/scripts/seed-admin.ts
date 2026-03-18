import mongoose from 'mongoose';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';

config();

// Імпортуємо моделі
import { User } from '../src/database/models/user.model';
import { Role } from '../src/database/models/role.model';
import { Permission } from '../src/database/models/permission.model';

/**
 * Скрипт для створення адміністратора
 * Використання: npm run seed:admin
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rack_calculator';

async function seedAdmin() {
  try {
    // Підключення до MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('[Seeder] Connected to MongoDB');

    // 1. Створення системних ролей
    console.log('[Seeder] Creating system roles...');

    const adminRole = await Role.findOneAndUpdate(
      { name: 'ADMIN' },
      {
        name: 'ADMIN',
        description: 'System Administrator - full access to all resources',
      },
      { upsert: true, new: true },
    );

    const managerRole = await Role.findOneAndUpdate(
      { name: 'MANAGER' },
      {
        name: 'MANAGER',
        description: 'Manager - can manage prices and rack sets',
      },
      { upsert: true, new: true },
    );

    const userRole = await Role.findOneAndUpdate(
      { name: 'USER' },
      {
        name: 'USER',
        description: 'Regular User - basic access',
      },
      { upsert: true, new: true },
    );

    console.log(`[Seeder] Created roles: ADMIN, MANAGER, USER`);

    // 2. Створення системних дозволів
    console.log('[Seeder] Creating system permissions...');

    const permissions = [
      { name: 'USERS_CREATE', resource: 'users', action: 'create' },
      { name: 'USERS_READ', resource: 'users', action: 'read' },
      { name: 'USERS_UPDATE', resource: 'users', action: 'update' },
      { name: 'USERS_DELETE', resource: 'users', action: 'delete' },
      { name: 'ROLES_CREATE', resource: 'roles', action: 'create' },
      { name: 'ROLES_READ', resource: 'roles', action: 'read' },
      { name: 'ROLES_UPDATE', resource: 'roles', action: 'update' },
      { name: 'ROLES_DELETE', resource: 'roles', action: 'delete' },
      { name: 'PRICES_CREATE', resource: 'prices', action: 'create' },
      { name: 'PRICES_READ', resource: 'prices', action: 'read' },
      { name: 'PRICES_UPDATE', resource: 'prices', action: 'update' },
      { name: 'PRICES_DELETE', resource: 'prices', action: 'delete' },
      { name: 'RACK_SETS_CREATE', resource: 'rack_sets', action: 'create' },
      { name: 'RACK_SETS_READ', resource: 'rack_sets', action: 'read' },
      { name: 'RACK_SETS_UPDATE', resource: 'rack_sets', action: 'update' },
      { name: 'RACK_SETS_DELETE', resource: 'rack_sets', action: 'delete' },
      { name: 'EXPORT_CREATE', resource: 'export', action: 'create' },
      { name: 'EXPORT_READ', resource: 'export', action: 'read' },
      { name: 'AUDIT_READ', resource: 'audit', action: 'read' },
      { name: 'ALL', resource: 'all', action: 'all' },
    ];

    const createdPermissions = await Promise.all(
      permissions.map((perm) =>
        Permission.findOneAndUpdate(
          { name: perm.name },
          {
            name: perm.name,
            description: `${perm.action} ${perm.resource}`,
            resource: perm.resource,
            action: perm.action,
          },
          { upsert: true, new: true },
        ),
      ),
    );

    console.log(`[Seeder] Created ${createdPermissions.length} permissions`);

    // 3. Призначити всі дозволи ролі ADMIN
    adminRole.permissions = createdPermissions.map((p) => p._id);
    await adminRole.save();
    console.log('[Seeder] Assigned all permissions to ADMIN role');

    // Призначити базові дозволи ролі MANAGER
    const managerPermissions = createdPermissions.filter(
      (p) =>
        p.resource === 'prices' ||
        p.resource === 'rack_sets' ||
        p.resource === 'export' ||
        (p.resource === 'users' && p.action === 'read'),
    );
    managerRole.permissions = managerPermissions.map((p) => p._id);
    await managerRole.save();
    console.log('[Seeder] Assigned permissions to MANAGER role');

    // Призначити базові дозволи ролі USER
    const userPermissions = createdPermissions.filter(
      (p) =>
        p.resource === 'rack_sets' ||
        p.resource === 'export' ||
        (p.resource === 'users' && p.action === 'read') ||
        (p.resource === 'prices' && p.action === 'read'),
    );
    userRole.permissions = userPermissions.map((p) => p._id);
    await userRole.save();
    console.log('[Seeder] Assigned permissions to USER role');

    // 4. Створення адміністратора
    console.log('[Seeder] Creating admin user...');

    const adminEmail = 'admin@accu-energo.com.ua';
    const adminPassword = 'Admin123456!'; // Змініть після першого входу!

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`[Seeder] Admin user already exists: ${adminEmail}`);

      // Перевіряємо чи має правильну роль
      const currentRoleId = existingAdmin.roleId?.toString();
      const expectedRoleId = adminRole._id.toString();

      if (currentRoleId !== expectedRoleId) {
        existingAdmin.roleId = adminRole._id;
        await existingAdmin.save();
        console.log(`[Seeder] ✅ Updated admin role to ADMIN (was: ${currentRoleId}, now: ${expectedRoleId})`);
      } else {
        console.log(`[Seeder] ✅ Admin already has ADMIN role`);
      }
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12);

      const adminUser = await User.create({
        email: adminEmail,
        passwordHash,
        roleId: adminRole._id,
        firstName: 'System',
        lastName: 'Administrator',
        emailVerified: true,
      });

      console.log(`[Seeder] Created admin user:`);
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log(`  Role: ADMIN`);
      console.log(`\n⚠️  IMPORTANT: Change the password after first login!`);
    }

    // 5. Створення тестового користувача (менеджер)
    const managerEmail = 'manager@accu-energo.com.ua';
    const managerPassword = 'Manager123!';

    const existingManager = await User.findOne({ email: managerEmail });
    if (existingManager) {
      console.log(`[Seeder] Manager user already exists: ${managerEmail}`);
    } else {
      const passwordHash = await bcrypt.hash(managerPassword, 12);

      await User.create({
        email: managerEmail,
        passwordHash,
        roleId: managerRole._id,
        firstName: 'Test',
        lastName: 'Manager',
        emailVerified: true,
      });

      console.log(`[Seeder] Created manager user:`);
      console.log(`  Email: ${managerEmail}`);
      console.log(`  Password: ${managerPassword}`);
      console.log(`  Role: MANAGER`);
    }

    // 6. Створення тестового користувача (користувач)
    const userEmail = 'user@accu-energo.com.ua';
    const userPassword = 'User123!';

    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      console.log(`[Seeder] User already exists: ${userEmail}`);
    } else {
      const passwordHash = await bcrypt.hash(userPassword, 12);

      await User.create({
        email: userEmail,
        passwordHash,
        roleId: userRole._id,
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
      });

      console.log(`[Seeder] Created user:`);
      console.log(`  Email: ${userEmail}`);
      console.log(`  Password: ${userPassword}`);
      console.log(`  Role: USER`);
    }

    // Статистика
    const usersCount = await User.countDocuments();
    const rolesCount = await Role.countDocuments();
    const permissionsCount = await Permission.countDocuments();

    console.log('\n[Seeder] Summary:');
    console.log(`  Users: ${usersCount}`);
    console.log(`  Roles: ${rolesCount}`);
    console.log(`  Permissions: ${permissionsCount}`);

    console.log('\n[Seeder] ✅ Done!');

    // Закриття підключення
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Запуск скрипту
seedAdmin();
