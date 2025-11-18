import { Router } from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { queries } from "../../db/index.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { generateString } from "../../utils/generators.js";
import logger from "../../logger/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

router.use(authenticateToken, requireAdmin);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".html", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .html and .docx files are allowed"));
    }
  },
});

router.get("/users", (req, res) => {
  try {
    const users = queries.getAllUsers.all();
    res.json({ users });
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { username, password, isAdmin = false } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const existingUser = queries.getUserByUsername.get(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = queries.createUser.run(
      username,
      passwordHash,
      isAdmin ? 1 : 0
    );

    logger.info(`User created: ${username} (ID: ${result.lastInsertRowid})`);

    res.status(201).json({
      success: true,
      user: {
        id: result.lastInsertRowid,
        username,
        isAdmin,
      },
    });
  } catch (error) {
    logger.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.delete("/users/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = queries.getUserById.get(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    queries.deleteUser.run(id);
    logger.info(`User deleted: ${user.username} (ID: ${id})`);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.put("/users/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = queries.getUserById.get(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    queries.updateUserPassword.run(passwordHash, id);

    logger.info(`Password updated for user: ${user.username} (ID: ${id})`);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    logger.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

router.get("/documents", (req, res) => {
  try {
    const documents = queries.getAllDocuments.all();
    res.json({ documents });
  } catch (error) {
    logger.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.post("/documents", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { displayName } = req.body;
    const filename = req.file.filename;
    const filePath = `/uploads/documents/${filename}`;
    const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);

    const result = queries.createDocument.run(
      filename,
      displayName || req.file.originalname,
      filePath,
      fileType
    );

    logger.info(
      `Document uploaded: ${displayName} (ID: ${result.lastInsertRowid})`
    );

    res.status(201).json({
      success: true,
      document: {
        id: result.lastInsertRowid,
        filename,
        displayName: displayName || req.file.originalname,
        filePath,
        fileType,
      },
    });
  } catch (error) {
    logger.error("Error uploading document:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

router.delete("/documents/:id", (req, res) => {
  try {
    const { id } = req.params;

    const document = queries.getDocumentById.get(id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const fullPath = path.join(__dirname, "../..", document.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    queries.deleteDocument.run(id);
    logger.info(`Document deleted: ${document.display_name} (ID: ${id})`);

    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    logger.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

router.get("/users/:id/documents", (req, res) => {
  try {
    const { id } = req.params;

    const user = queries.getUserById.get(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const documents = queries.getUserDocuments.all(id);
    res.json({ documents });
  } catch (error) {
    logger.error("Error fetching user documents:", error);
    res.status(500).json({ error: "Failed to fetch user documents" });
  }
});

router.post("/users/:id/documents", (req, res) => {
  try {
    const { id } = req.params;
    const { documentIds } = req.body;

    if (!Array.isArray(documentIds)) {
      return res.status(400).json({ error: "documentIds must be an array" });
    }

    const user = queries.getUserById.get(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    queries.clearUserDocuments.run(id);

    for (const docId of documentIds) {
      queries.assignDocumentToUser.run(id, docId);
    }

    logger.info(
      `Documents assigned to user ${user.username}: ${documentIds.join(", ")}`
    );

    res.json({
      success: true,
      message: "Documents assigned successfully",
    });
  } catch (error) {
    logger.error("Error assigning documents:", error);
    res.status(500).json({ error: "Failed to assign documents" });
  }
});

router.delete("/users/:userId/documents/:documentId", (req, res) => {
  try {
    const { userId, documentId } = req.params;

    queries.removeDocumentFromUser.run(userId, documentId);

    res.json({
      success: true,
      message: "Document removed from user successfully",
    });
  } catch (error) {
    logger.error("Error removing document from user:", error);
    res.status(500).json({ error: "Failed to remove document from user" });
  }
});

router.get("/generate/username", (req, res) => {
  try {
    const username = generateString(16);
    res.json({ username });
  } catch (error) {
    logger.error("Error generating username:", error);
    res.status(500).json({ error: "Failed to generate username" });
  }
});

router.get("/generate/password", (req, res) => {
  try {
    const length = parseInt(req.query.length) || 16;
    const password = generateString(length);
    res.json({ password });
  } catch (error) {
    logger.error("Error generating password:", error);
    res.status(500).json({ error: "Failed to generate password" });
  }
});

export default router;
