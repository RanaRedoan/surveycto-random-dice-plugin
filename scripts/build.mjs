import { mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

mkdirSync("dist", { recursive: true });

for (const file of readdirSync("src")) {
  if (file.endsWith(".js") || file.endsWith(".css")) {
    copyFileSync(join("src", file), join("dist", file));
  }
}

console.log("Build complete: copied src/*.js and src/*.css to dist/.");
