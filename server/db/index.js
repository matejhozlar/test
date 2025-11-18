import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = path.join(__dirname, "app.db");
const schemaPath = path.join(__dirname, "schema.sql");

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

export const queries = {
  getUserByUsername: db.prepare("SELECT * FROM users WHERE username = ?"),
  getUserById: db.prepare("SELECT * FROM users WHERE id = ?"),
  getAllUsers: db.prepare(
    "SELECT id, username, is_admin, created_at FROM users"
  ),
  createUser: db.prepare(
    "INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)"
  ),
  deleteUser: db.prepare("DELETE FROM users WHERE id = ?"),
  updateUserPassword: db.prepare(
    "UPDATE users SET password_hash = ? WHERE id = ?"
  ),
  getAllDocuments: db.prepare("SELECT * FROM documents"),
  getDocumentById: db.prepare("SELECT * FROM documents WHERE id = ?"),
  createDocument: db.prepare(
    "INSERT INTO documents (filename, display_name, file_path, file_type) VALUES (?, ?, ?, ?)"
  ),
  deleteDocument: db.prepare("DELETE FROM documents WHERE id = ?"),
  getUserDocuments: db.prepare(
    "SELECT d.* FROM documents d INNER JOIN user_documents ud ON d.id = ud.document_id WHERE ud.user_id = ?"
  ),
  assignDocumentToUser: db.prepare(
    "INSERT OR IGNORE INTO user_documents (user_id, document_id) VALUES (?, ?)"
  ),
  removeDocumentFromUser: db.prepare(
    "DELETE FROM user_documents WHERE user_id = ? AND document_id = ?"
  ),
  getDocumentUsers: db.prepare(
    "SELECT u.id, u.username FROM users u INNER JOIN user_documents ud on ud.id = ud.user_id WHERE ud.document_id = ?"
  ),
  clearUserDocuments: db.prepare(
    "DELETE FROM user_documents WHERE user_id = ?"
  ),
};

export default db;
