import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function collectJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...collectJsFiles(full));
      continue;
    }
    if (full.endsWith(".js") || full.endsWith(".mjs")) {
      out.push(full);
    }
  }
  return out;
}

const files = [...collectJsFiles("src"), ...collectJsFiles("scripts"), ...collectJsFiles("test")];
let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Checked ${files.length} files.`);
