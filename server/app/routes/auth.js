import { Router } from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { queries } from "../../db/index.js";
import { generateToken, authenticateToken } from "../middleware/auth.js";
import logger from "../../logger/index.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username or password required" });
    }

    const user = queries.getUserByUsername.get(username);

    if (!user) {
      logger.warn("Failed login attempt for username:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      logger.warn("Failed login attempt for username:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    logger.info("User logged in:", username);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin === 1,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ success: true, message: "Logged out successfully" });
});

router.get("/check", authenticateToken, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      isAdmin: req.user.isAdmin,
    },
  });
});

export default router;
