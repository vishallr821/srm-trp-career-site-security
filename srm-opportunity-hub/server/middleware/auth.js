const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Try to get token from:
  // 1. HttpOnly cookie (preferred)
  // 2. Authorization header (for backward compatibility during transition)
  
  let token = req.cookies?.access_token;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      error: {
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN',
        requestId: req.id,
      },
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: {
          message: 'Invalid or expired token.',
          code: 'INVALID_TOKEN',
          requestId: req.id,
        },
      });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        message: 'Access denied. Admin role required.',
        code: 'ADMIN_REQUIRED',
        requestId: req.id,
      },
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
