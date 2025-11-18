import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE_DIR = path.join(__dirname, "..", "..");
const OUTPUT_PATH = path.resolve("server/config/env/vars/requiredVars.js");

function findEnvVarsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  content = content.replace(/\/\*[\s\S]*?\*\//g, "");

  content = content.replace(/\/\/.*/g, "");

  content = content.replace(/(['"`])(?:\\[\s\S]|(?!\1).)*\1/g, "");

  const matches = content.matchAll(/\bprocess\.env\.([A-Z0-9_]+)\b/g);
  return Array.from(matches, (m) => m[1]);
}

function generateRequiredEnvVars(outputPath) {
  const allFiles = glob.sync(["**/*.js"], {
    cwd: SOURCE_DIR,
    ignore: [
      "node_modules/**",
      "client/**",
      "build/**",
      "dist/**",
      "scripts/**",
    ],
    absolute: true,
  });

  const envVars = new Set();

  for (const file of allFiles) {
    try {
      const vars = findEnvVarsInFile(file);
      vars.forEach((v) => envVars.add(v));
    } catch (error) {
      console.warn(`Skipping unreadable file ${file}: ${error}`);
    }
  }

  const sortedVars = Array.from(envVars).sort();

  const jsContent = `const REQUIRED_VARS = [\n${sortedVars
    .map((v) => `  "${v}",`)
    .join("\n")}\n];\n\nexport default REQUIRED_VARS;\n`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, jsContent);
  console.log(`Wrote ${sortedVars.length} required env vars to ${outputPath}`);
}

generateRequiredEnvVars(OUTPUT_PATH);
