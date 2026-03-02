import jwt from 'jsonwebtoken';

/**
 * Middleware для перевірки JWT токену
 */
export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware для опціональної авторизації (не блокує якщо немає токену)
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Ігноруємо помилки, токен просто не валідний
  }
  next();
};

export default {
  authenticate,
  optionalAuth,
};
