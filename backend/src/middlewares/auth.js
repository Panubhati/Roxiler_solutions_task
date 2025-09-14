const jwt = require("jsonwebtoken");

function authMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 

      // Role check
      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }

      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = authMiddleware;
