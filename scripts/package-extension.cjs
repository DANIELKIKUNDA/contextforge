#!/usr/bin/env node
/**
 * Package ContextForge VS Code extension into .vsix
 * Usage: node scripts/package-extension.cjs
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const EXT_DIR = path.join(ROOT, "apps", "vscode-extension");
const RELEASE_DIR = path.join(ROOT, "artifacts", "release");
const OUTFILE = path.join(RELEASE_DIR, "contextforge-1.0.0-rc.1.vsix");

// Ensure release directory exists
fs.mkdirSync(RELEASE_DIR, { recursive: true });

// Find vsce binary
const vsceBin = path.join(
  ROOT,
  "node_modules",
  ".pnpm",
  "@vscode+vsce@3.9.2",
  "node_modules",
  "@vscode",
  "vsce",
  "out",
  "main.js"
);

if (!fs.existsSync(vsceBin)) {
  console.error("vsce not found at", vsceBin);
  const vsceDir = path.join(ROOT, "node_modules", ".pnpm");
  const dirs = fs.readdirSync(vsceDir).filter((d) => d.includes("vsce"));
  console.error("Available vsce packages:", dirs.join(", "));
  process.exit(1);
}

console.log("Packaging extension...");
console.log("  Source:", EXT_DIR);
console.log("  Output:", OUTFILE);

try {
  execSync(
    `"${process.execPath}" "${vsceBin}" package --out "${OUTFILE}"`,
    {
      cwd: EXT_DIR,
      stdio: "inherit",
      timeout: 120000,
    }
  );
  console.log("\n✅ VSIX generated successfully!");

  // Compute SHA-256
  const crypto = require("crypto");
  const buf = fs.readFileSync(OUTFILE);
  const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
  const size = buf.length;

  console.log(`  File: ${OUTFILE}`);
  console.log(`  Size: ${(size / 1024).toFixed(1)} KB (${size} bytes)`);
  console.log(`  SHA-256: ${sha256}`);

  // Write checksum file
  const checksumFile = OUTFILE + ".sha256";
  fs.writeFileSync(checksumFile, `${sha256}  ${path.basename(OUTFILE)}\n`);
  console.log(`  Checksum: ${checksumFile}`);
} catch (err) {
  console.error("\n❌ Packaging failed:", err.message);
  process.exit(1);
}