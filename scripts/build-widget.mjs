import * as esbuild from "esbuild";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.meetzy.ai";

await esbuild.build({
  entryPoints: [resolve(root, "widget-src/index.ts")],
  bundle: true,
  minify: true,
  target: ["es2018"],
  format: "iife",
  outfile: resolve(root, "public/widget.js"),
  define: {
    "__MEETZY_APP_URL__": JSON.stringify(appUrl),
  },
  banner: {
    js: `/* Meetzy Widget v1.0 — https://meetzy.ai */`,
  },
});

// Post-process to inject APP_URL
const output = readFileSync(resolve(root, "public/widget.js"), "utf8");
const replaced = output.replace(/%%APP_URL%%/g, appUrl);
writeFileSync(resolve(root, "public/widget.js"), replaced);

const stats = readFileSync(resolve(root, "public/widget.js"));
console.log(`✓ Widget built: ${(stats.length / 1024).toFixed(1)}kb`);
