/**
 * Міграція 009: Створення таблиці roles та permissions
 *
 * Призначення:
 * - Зберігання ролей в БД
 * - Зберігання дозволів для кожної ролі
 * - Можливість додавати нові ролі через адмін-панель
 */

export const up = (db) => {
  console.log("[Migration 009] Creating roles and permissions tables...");

  try {
    // Таблиця ролей
    db.exec(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        is_default BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("[Migration 009] Created roles table");

    // Таблиця дозволів
    db.exec(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("[Migration 009] Created permissions table");

    // Таблиця зв'язку ролей та дозволів
    db.exec(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE(role_id, permission_id)
      )
    `);
    console.log("[Migration 009] Created role_permissions table");

    // Таблиця price_types для ролей
    db.exec(`
      CREATE TABLE IF NOT EXISTS role_price_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL,
        price_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE(role_id, price_type)
      )
    `);
    console.log("[Migration 009] Created role_price_types table");

    // Додаємо ролі за замовчуванням
    db.exec(`
      INSERT INTO roles (name, label, description, is_default, is_active) VALUES
        ('admin', 'Адміністратор', 'Повний доступ до всіх функцій системи', 1, 1),
        ('manager', 'Менеджер', 'Доступ до сторінки "Акумулятор", нульові ціни', 0, 1),
        ('user', 'Користувач', 'Обмежений доступ (після активації адміном)', 1, 1)
    `);
    console.log("[Migration 009] Inserted default roles");

    // Додаємо дозволи
    const permissions = [
      // Сторінки
      ["view_rack_page", 'Перегляд сторінки "Стелаж"', "pages"],
      ["view_battery_page", 'Перегляд сторінки "Акумулятор"', "pages"],
      ["view_admin_page", "Перегляд адмін-панелі", "pages"],

      // Дії
      ["create_rack_set", "Створення комплекту стелажів", "actions"],
      ["edit_rack_set", "Редагування комплекту стелажів", "actions"],
      ["delete_rack_set", "Видалення комплекту стелажів", "actions"],
      ["export_rack_set", "Експорт комплекту стелажів", "actions"],

      // Ціни
      ["view_price_retail", "Перегляд роздрібної ціни", "prices"],
      ["view_price_wholesale", "Перегляд оптової ціни", "prices"],
      ["view_price_cost", "Перегляд ціни собівартості", "prices"],
      ["view_price_zero", "Перегляд нульової ціни", "prices"],
      ["edit_price", "Редагування цін", "prices"],

      // Користувачі
      ["view_users", "Перегляд користувачів", "users"],
      ["create_user", "Створення користувача", "users"],
      ["edit_user", "Редагування користувача", "users"],
      ["delete_user", "Видалення користувача", "users"],
      ["manage_roles", "Управління ролями", "users"],
    ];

    for (const [name, label, category] of permissions) {
      db.prepare(
        `
        INSERT INTO permissions (name, label, category) VALUES (?, ?, ?)
      `,
      ).run(name, label, category);
    }
    console.log("[Migration 009] Inserted permissions");

    // Додаємо price types для ролей
    const rolePriceTypes = {
      admin: [
        "без_ізоляторів",
        "загальна",
        "нульова",
        "собівартість",
        "оптова",
      ],
      manager: ["нульова"],
      user: [],
    };

    const roles = db.prepare("SELECT id, name FROM roles").all();
    for (const role of roles) {
      const priceTypes = rolePriceTypes[role.name] || [];
      for (const priceType of priceTypes) {
        db.prepare(
          `
          INSERT INTO role_price_types (role_id, price_type) VALUES (?, ?)
        `,
        ).run(role.id, priceType);
      }
    }
    console.log("[Migration 009] Inserted role_price_types");

    // Додаємо дозволи для ролей
    const rolePermissions = {
      admin: [
        "view_rack_page",
        "view_battery_page",
        "view_admin_page",
        "create_rack_set",
        "edit_rack_set",
        "delete_rack_set",
        "export_rack_set",
        "view_price_retail",
        "view_price_wholesale",
        "view_price_cost",
        "view_price_zero",
        "edit_price",
        "view_users",
        "create_user",
        "edit_user",
        "delete_user",
        "manage_roles",
      ],
      manager: [
        "view_battery_page",
        "create_rack_set",
        "export_rack_set",
        "view_price_zero",
      ],
      user: [],
    };

    for (const role of roles) {
      const perms = rolePermissions[role.name] || [];
      for (const permName of perms) {
        const permission = db
          .prepare("SELECT id FROM permissions WHERE name = ?")
          .get(permName);
        if (permission) {
          db.prepare(
            `
            INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)
          `,
          ).run(role.id, permission.id);
        }
      }
    }
    console.log("[Migration 009] Inserted role_permissions");

    // Створюємо індекси
    db.exec("CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name)");
    db.exec(
      "CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name)",
    );
    db.exec(
      "CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id)",
    );
    db.exec(
      "CREATE INDEX IF NOT EXISTS idx_role_price_types_role_id ON role_price_types(role_id)",
    );
    console.log("[Migration 009] Created indexes");

    console.log("[Migration 009] Completed successfully");
  } catch (error) {
    console.error("[Migration 009] Error:", error.message);
    throw error;
  }
};

export const down = (db) => {
  console.log("[Migration 009] Rolling back...");

  try {
    db.exec("DROP TABLE IF EXISTS role_price_types");
    db.exec("DROP TABLE IF EXISTS role_permissions");
    db.exec("DROP TABLE IF EXISTS permissions");
    db.exec("DROP TABLE IF EXISTS roles");

    console.log("[Migration 009] Rollback completed");
  } catch (error) {
    console.error("[Migration 009] Rollback error:", error.message);
    throw error;
  }
};

export default { up, down };
