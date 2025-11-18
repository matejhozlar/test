import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      isAdmin: user.is_admin === 1,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};
