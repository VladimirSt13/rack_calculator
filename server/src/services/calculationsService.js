import { getDb } from "../db/index.js";

export const getCalculations = async (userId, filters = {}) => {
  const db = await getDb();
  const { type, limit = 50 } = filters;

  let query =
    "SELECT id, name, type, data, created_at FROM calculations WHERE user_id = ?";
  const params = [userId];

  if (type) {
    query += " AND type = ?";
    params.push(type);
  }

  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(parseInt(limit));

  return db.prepare(query).all(...params);
};

export const createCalculation = async (userId, calculationData) => {
  const db = await getDb();
  const { name, type, data } = calculationData;

  if (!data || typeof data !== "object") {
    throw new Error("Invalid calculation data");
  }

  if (!type || !["rack", "battery"].includes(type)) {
    throw new Error('Invalid type. Must be "rack" or "battery"');
  }

  const result = db
    .prepare(
      `
    INSERT INTO calculations (user_id, name, type, data)
    VALUES (?, ?, ?, ?)
  `,
    )
    .run(userId, name || null, type, JSON.stringify(data));

  return db
    .prepare(
      `
    SELECT id, name, type, data, created_at
    FROM calculations
    WHERE id = ?
  `,
    )
    .get(result.lastInsertRowid);
};

export const getCalculation = async (userId, id) => {
  const db = await getDb();

  return db
    .prepare(
      `
    SELECT id, name, type, data, created_at
    FROM calculations
    WHERE id = ? AND user_id = ?
  `,
    )
    .get(id, userId);
};

export const deleteCalculation = async (userId, id) => {
  const db = await getDb();

  const result = db
    .prepare(
      `
    DELETE FROM calculations
    WHERE id = ? AND user_id = ?
  `,
    )
    .run(id, userId);

  return result.changes > 0;
};

export default {
  getCalculations,
  createCalculation,
  getCalculation,
  deleteCalculation,
};
