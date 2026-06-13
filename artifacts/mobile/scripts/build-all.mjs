/**
 * build-all.mjs
 * Builds admin panel (Vite) + student app (Expo web) and merges them into
 * artifacts/mobile/dist so both are served from ONE Vercel frontend:
 *   /          → student Expo web app
 *   /admin/    → admin Vite SPA
 */

import { execSync } from "child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileDir = resolve(__dirname, "..");
const workspaceRoot = resolve(mobileDir, "../..");
const adminDir = resolve(workspaceRoot, "artifacts/admin");

// Admin build output (vite outputs to dist/public with base /admin/)
const adminDistDir = resolve(adminDir, "dist/public");

// Combined output directory
const outDir = resolve(mobileDir, "dist");
const adminOutDir = resolve(outDir, "admin");

const apiDomain = process.env.EXPO_PUBLIC_DOMAIN || "";

// ─── 1. Build Admin Panel ──────────────────────────────────────────────────
console.log("\n── Building admin panel (Vite)…");
execSync("npx pnpm run build", {
  cwd: adminDir,
  env: { ...process.env, PORT: "5173", BASE_PATH: "/admin/" },
  stdio: "inherit",
});

// ─── 2. Export Expo Web App ────────────────────────────────────────────────
console.log("\n── Exporting student app (Expo web)…");
if (existsSync(outDir)) rmSync(outDir, { recursive: true });

execSync("npx expo export -p web --output-dir dist", {
  cwd: mobileDir,
  env: { ...process.env, EXPO_PUBLIC_DOMAIN: apiDomain },
  stdio: "inherit",
});

// ─── 3. Copy Admin Build into dist/admin/ ─────────────────────────────────
console.log("\n── Merging admin into dist/admin/…");
if (existsSync(adminOutDir)) rmSync(adminOutDir, { recursive: true });
mkdirSync(adminOutDir, { recursive: true });
cpSync(adminDistDir, adminOutDir, { recursive: true });

console.log("\n✅ Combined build complete!");
console.log(`   Student app → ${outDir}/index.html`);
console.log(`   Admin panel → ${adminOutDir}/index.html`);
