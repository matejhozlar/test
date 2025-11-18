import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const buildDir = path.join(__dirname, "build");
const exclude = new Set([
  "node_modules",
  "logs",
  "docs",
  "docker",
  ".dockerignore",
  "docker-compose.yml",
  "Dockerfile",
  "client.zip",
  "app.zip",
  "manuals-website.zip",
  "fonts.zip",
  "output",
  "docx-to-html.js",
  "build.js",
  "README.md",
  "build",
]);

const shouldExclude = (file) => exclude.has(file);

const copyRecursive = async (src, dest) => {
  const stats = await fs.promises.stat(src);
  if (stats.isDirectory()) {
    await fs.promises.mkdir(dest, { recursive: true });
    const entries = await fs.promises.readdir(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      await copyRecursive(srcPath, destPath);
    }
  } else {
    await fs.promises.copyFile(src, dest);
  }
};

const main = async () => {
  try {
    if (fs.existsSync(buildDir)) {
      console.log("[INFO] Removing existing build directory...");
      await fs.promises.rm(buildDir, { recursive: true, force: true });
    }

    await fs.promises.mkdir(buildDir, { recursive: true });
    const entries = await fs.promises.readdir(__dirname);
    for (const entry of entries) {
      if (shouldExclude(entry)) continue;

      const srcPath = path.join(__dirname, entry);
      const destPath = path.join(buildDir, entry);
      const stats = await fs.promises.stat(srcPath);

      if (entry === "client" && stats.isDirectory()) {
        const clientDist = path.join(srcPath, "dist");
        const clientDistExists = fs.existsSync(clientDist);
        if (clientDistExists) {
          const destClient = path.join(destPath, "dist");
          await copyRecursive(clientDist, destClient);
        }
        continue;
      }

      await copyRecursive(srcPath, destPath);
    }

    console.log("[SUCCESS] Build folder created successfully");
  } catch (error) {
    console.error("[ERROR] Failed to create build directory", error);
  }
};

main();
