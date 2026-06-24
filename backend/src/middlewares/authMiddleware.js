const { verifyToken } = require('../utils/generateToken');
const pool = require('../config/db');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT rp.permission_id FROM Role_Permissions rp
         JOIN Roles r ON rp.role_id = r.role_id
         JOIN Permissions p ON rp.permission_id = p.permission_id
         WHERE r.role_name = $1 AND p.permission_name = $2`,
        [req.user.role, permission]
      );
      if (result.rows.length === 0) {
        return res.status(403).json({
          message: `Access denied. You don't have permission: ${permission}`
        });
      }
      next();
    } catch (err) {
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

module.exports = { protect, allowRoles, hasPermission };