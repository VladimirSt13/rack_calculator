import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rack Calculator API",
      version: "2.0.0",
      description:
        'API для калькулятора стелажів та підбору акумуляторів для компанії "Акку-енерго"',
      contact: {
        name: "Акку-енерго",
        email: "support@accu-energo.com.ua",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3001/api",
        description: "Development server",
      },
      {
        url: "https://api.rack-calculator.com/api",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Аутентифікація та авторизація",
      },
      {
        name: "Users",
        description: "Управління користувачами",
      },
      {
        name: "Roles",
        description: "Управління ролями та дозволами",
      },
      {
        name: "Rack",
        description: "Розрахунок стелажів",
      },
      {
        name: "Battery",
        description: "Підбір стелажів для акумуляторів",
      },
      {
        name: "Rack Sets",
        description: "Збереження та експорт комплектів стелажів",
      },
      {
        name: "Prices",
        description: "Управління прайсами",
      },
      {
        name: "Audit",
        description: "Журнал аудиту",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT токен отриманий після логіну",
        },
      },
      schemas: {
        // User schemas
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: {
              type: "string",
              format: "email",
              example: "user@accu-energo.com.ua",
            },
            role: {
              type: "string",
              enum: ["admin", "manager", "user"],
              example: "user",
            },
            permissions: {
              type: "object",
              description: "Дозволи користувача",
              example: { price_types: ["нульова", "без_ізоляторів"] },
            },
            emailVerified: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        UserCreate: {
          type: "object",
          required: ["email", "password", "role"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@accu-energo.com.ua",
            },
            password: { type: "string", minLength: 6, example: "P@ssw0rd13" },
            role: {
              type: "string",
              enum: ["admin", "manager", "user"],
              example: "user",
            },
            permissions: {
              type: "object",
              properties: {
                price_types: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: [
                      "базова",
                      "без_ізоляторів",
                      "нульова",
                      "собівартість",
                      "оптова",
                    ],
                  },
                },
              },
            },
          },
        },

        // Auth schemas
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@accu-energo.com.ua",
            },
            password: { type: "string", minLength: 6, example: "P@ssw0rd13" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                accessToken: { type: "string", example: "eyJhbGc..." },
                refreshToken: { type: "string", example: "dGVzdC0..." },
              },
            },
            message: { type: "string", example: "Login successful" },
          },
        },

        // Rack schemas
        RackCalculationRequest: {
          type: "object",
          required: ["floors", "rows", "beamsPerRow"],
          properties: {
            floors: { type: "integer", minimum: 1, maximum: 10, example: 3 },
            rows: { type: "integer", minimum: 1, maximum: 4, example: 2 },
            beamsPerRow: {
              type: "integer",
              minimum: 1,
              maximum: 20,
              example: 2,
            },
            supports: {
              type: "string",
              example: "C",
              description: "Тип опори",
            },
            verticalSupports: {
              type: "string",
              example: "V",
              description: "Тип вертикальної опори",
            },
            spans: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: {
                    type: "string",
                    example: "3000",
                    description: "Довжина прольоту в мм",
                  },
                  quantity: { type: "integer", minimum: 1, example: 2 },
                },
              },
            },
          },
        },
        RackCalculationResponse: {
          type: "object",
          properties: {
            name: { type: "string", example: "Стелаж 3х2х2" },
            components: { type: "object", description: "Компоненти стелажа" },
            prices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["базова", "без_ізоляторів", "нульова"],
                  },
                  value: { type: "number", example: 1500.0 },
                  label: { type: "string", example: "Базова ціна" },
                },
              },
            },
            totalCost: { type: "number", example: 1500.0 },
            rackConfigId: { type: "integer", example: 1 },
          },
        },

        // Battery schemas
        BatteryCalculationRequest: {
          type: "object",
          required: ["batteryDimensions", "quantity"],
          properties: {
            batteryDimensions: {
              type: "object",
              required: ["length", "width", "height", "weight"],
              properties: {
                length: {
                  type: "number",
                  example: 407,
                  description: "Довжина в мм",
                },
                width: {
                  type: "number",
                  example: 176,
                  description: "Ширина в мм",
                },
                height: {
                  type: "number",
                  example: 240,
                  description: "Висота в мм",
                },
                weight: {
                  type: "number",
                  example: 30,
                  description: "Вага в кг",
                },
              },
            },
            quantity: { type: "integer", minimum: 1, example: 24 },
            format: {
              type: "string",
              example: "L",
              description: "Бажаний формат розміщення",
            },
          },
        },
        BatteryVariant: {
          type: "object",
          properties: {
            id: { type: "string", example: "var_1" },
            name: { type: "string", example: "Варіант 1" },
            rackLength: { type: "number", example: 6000 },
            batteriesPerRow: { type: "integer", example: 14 },
            rows: { type: "integer", example: 2 },
            totalBatteries: { type: "integer", example: 28 },
            prices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  value: { type: "number" },
                  label: { type: "string" },
                },
              },
            },
            totalCost: { type: "number", example: 2500.0 },
          },
        },

        // Rack Set schemas
        RackSet: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", example: 1 },
            name: { type: "string", example: "Комплект для складу №1" },
            objectName: { type: "string", example: "Склад основний" },
            description: {
              type: "string",
              example: "Стелажі для зберігання акумуляторів",
            },
            racks: {
              type: "array",
              items: { $ref: "#/components/schemas/BatteryVariant" },
            },
            totalCost: { type: "number", example: 15000.0 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Error schemas
        Error: {
          type: "object",
          required: ["error"],
          properties: {
            error: { type: "string", example: "Invalid credentials" },
            code: { type: "string", example: "UNAUTHORIZED" },
            message: { type: "string", example: "Додаткове повідомлення" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            error: { type: "string", example: "Validation failed" },
            code: { type: "string", example: "VALIDATION_ERROR" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email format" },
                },
              },
            },
          },
        },

        // Audit schemas
        AuditLog: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", nullable: true, example: 1 },
            userEmail: {
              type: "string",
              nullable: true,
              example: "user@accu-energo.com.ua",
            },
            action: {
              type: "string",
              enum: [
                "CREATE",
                "UPDATE",
                "DELETE",
                "LOGIN",
                "LOGOUT",
                "PASSWORD_CHANGE",
              ],
              example: "LOGIN",
            },
            entityType: { type: "string", example: "user" },
            entityId: { type: "integer", nullable: true, example: 1 },
            oldValue: { type: "object", nullable: true },
            newValue: { type: "object", nullable: true },
            ipAddress: { type: "string", example: "192.168.1.1" },
            userAgent: { type: "string", example: "Mozilla/5.0..." },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // Pagination
        PaginatedResponse: {
          type: "object",
          properties: {
            data: { type: "array" },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 20 },
                total: { type: "integer", example: 100 },
                totalPages: { type: "integer", example: 5 },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./server/src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
