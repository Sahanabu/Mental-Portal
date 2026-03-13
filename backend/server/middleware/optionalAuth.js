const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // No token - allow anonymous access
    req.userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.isAnonymous = true;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.isAnonymous = false;
    next();
  } catch (error) {
    // Invalid token - treat as anonymous
    req.userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.isAnonymous = true;
    next();
  }
};

module.exports = optionalAuth;
