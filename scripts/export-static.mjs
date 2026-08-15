#!/usr/bin/env node
/**
 * Membangun paket statis (SPA murni) + menjalankan validasi + mengemas ZIP.
 *
 * Hasil:
 *   public/exports/remindly-static.zip
 *   public/exports/remindly-static.json  (metadata + hasil validasi)
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "dist-static");
const exportsDir = path.join(root, "public", "exports");
const zipName = "remindly-static.zip";

function run(cmd, args) {
  execFileSync(cmd, args, { cwd: root, stdio: "inherit" });
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

// 1. Build SPA
run("npx", ["vite", "build", "--config", "vite.static.config.ts"]);

// 2. index.html + fallback 404.html
const builtHtml = path.join(outDir, "index.static.html");
const indexHtml = path.join(outDir, "index.html");
if (fs.existsSync(builtHtml)) fs.renameSync(builtHtml, indexHtml);
if (fs.existsSync(indexHtml)) fs.copyFileSync(indexHtml, path.join(outDir, "404.html"));

// 3. Konfigurasi hosting
fs.writeFileSync(
  path.join(outDir, ".htaccess"),
  `Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
`,
);
fs.writeFileSync(path.join(outDir, "_redirects"), "/*    /index.html   200\n");
fs.writeFileSync(
  path.join(outDir, "vercel.json"),
  JSON.stringify({ rewrites: [{ source: "/(.*)", destination: "/index.html" }] }, null, 2) + "\n",
);
fs.writeFileSync(
  path.join(outDir, "nginx.conf.example"),
  "location / {\n  try_files $uri $uri/ /index.html;\n}\n",
);

// 4. Validasi
const files = walk(outDir).map((p) => path.relative(outDir, p));
const html = fs.existsSync(indexHtml) ? fs.readFileSync(indexHtml, "utf8") : "";
const jsFiles = files.filter((f) => f.endsWith(".js"));
const jsSource = jsFiles.map((f) => fs.readFileSync(path.join(outDir, f), "utf8")).join("\n");

const checks = [
  {
    id: "entry",
    label: "Entry point index.html tersedia",
    ok: html.includes('id="root"') && /<script[^>]+src=/.test(html),
    detail: "index.html memuat div root dan tag script bundel.",
  },
  {
    id: "assets",
    label: "Aset JS/CSS lengkap",
    ok: jsFiles.length > 0 && files.some((f) => f.endsWith(".css")),
    detail: `${jsFiles.length} berkas JS dan ${files.filter((f) => f.endsWith(".css")).length} berkas CSS.`,
  },
  {
    id: "relative",
    label: "Jalur aset relatif (aman di subfolder)",
    ok: !/src="\/assets|href="\/assets/.test(html),
    detail: "Semua referensi aset memakai ./assets sehingga bisa dipasang di subfolder.",
  },
  {
    id: "credentials",
    label: "Kredensial publik backend ter-inject",
    ok: jsSource.includes("supabase.co") || jsSource.includes("sb_publishable_"),
    detail: "URL backend dan kunci publik tersedia di bundel.",
  },
  {
    id: "no-secrets",
    label: "Tidak ada rahasia server yang ikut",
    ok: !/sb_secret_[A-Za-z0-9_-]{12,}|"service_role"|LOVABLE_API_KEY\s*[:=]\s*"[^"]+"/.test(jsSource),
    detail: "Bundel tidak memuat service role key atau rahasia server lainnya.",
  },
  {
    id: "spa-fallback",
    label: "Konfigurasi rewrite hosting disertakan",
    ok: ["\.htaccess", "_redirects", "vercel.json", "404.html"].every((f) =>
      files.includes(f.replace("\\", "")),
    ),
    detail: ".htaccess, _redirects, vercel.json, dan 404.html ikut dalam paket.",
  },
];

const failed = checks.filter((c) => !c.ok);
fs.mkdirSync(exportsDir, { recursive: true });
const zipPath = path.join(exportsDir, zipName);
if (fs.existsSync(zipPath)) fs.rmSync(zipPath);

if (failed.length === 0) {
  execFileSync("zip", ["-r", "-q", zipPath, ".", "-x", ".vite/*"], { cwd: outDir });
}

const stat = fs.existsSync(zipPath) ? fs.statSync(zipPath) : null;
fs.writeFileSync(
  path.join(exportsDir, "remindly-static.json"),
  JSON.stringify(
    {
      file: zipName,
      bytes: stat?.size ?? 0,
      builtAt: new Date().toISOString(),
      fileCount: files.length,
      valid: failed.length === 0,
      checks,
    },
    null,
    2,
  ) + "\n",
);

for (const c of checks) console.log(`${c.ok ? "OK  " : "GAGAL"} ${c.label}`);
if (failed.length > 0) {
  console.error(`\n${failed.length} pemeriksaan gagal — ZIP tidak dibuat.`);
  process.exit(1);
}
console.log(`\nPaket siap: public/exports/${zipName} (${((stat?.size ?? 0) / 1048576).toFixed(2)} MB)`);
