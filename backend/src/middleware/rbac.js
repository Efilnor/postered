const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    req.user = payload; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function hasPermission(permissionRequired) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    
    const authorized = userPermissions.includes('*:*') || userPermissions.includes(permissionRequired);

    if (!authorized) {
      return res.status(403).json({ error: `Permission requise : ${permissionRequired}` });
    }
    next();
  };
}

module.exports = { requireAuth, hasPermission };