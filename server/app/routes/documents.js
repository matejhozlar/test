import { Router } from "express";
import { queries } from "../../db/index.js";
import { authenticateToken } from "../middleware/auth.js";
import logger from "../../logger/index.js";

const router = Router();

router.use(authenticateToken);

router.get("/user", (req, res) => {
  try {
    const userId = req.user.id;
    const documents = queries.getUserDocuments.all(userId);

    logger.info(
      `User ${req.user.username} fetched ${documents.length} documents`
    );

    res.json({ documents });
  } catch (error) {
    logger.error("Error fetching user documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const userDocuments = queries.getUserDocuments.all(userId);
    const hasAccess = userDocuments.some((doc) => doc.id === parseInt(id));

    if (!hasAccess) {
      logger.warn(
        `User ${req.user.username} attempted to access document ${id} without permission`
      );
      return res.status(403).json({ error: "Access denied" });
    }

    const document = queries.getDocumentById.get(id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    logger.info(
      `User ${req.user.username} accessed document ${document.display_name} (ID: ${id})`
    );

    res.json({ document });
  } catch (error) {
    logger.error("Error fetching document:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

export default router;
