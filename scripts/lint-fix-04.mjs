// scripts/lint-fix-04.mjs — correcciones lint fase 0.4 (archivos generados shadcn)
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const r = spawnSync("npx", ["eslint", "src/", "--format", "json"], {
  encoding: "utf8",
  maxBuffer: 1 << 22,
});
const data = JSON.parse(r.stdout || "[]");

for (const f of data) {
  if (!f.messages.length) continue;
  let code = readFileSync(f.filePath, "utf8");
  let changed = false;

  for (const m of f.messages) {
    if (m.ruleId === "no-unused-vars" && m.message.includes("'React'")) {
      const withoutImport = code.replace(/^import \* as React from "react"\r?\n/m, "");
      // Solo quitar si React no se usa en el resto
      if (!/React\./.test(withoutImport)) {
        code = withoutImport;
        changed = true;
      }
    }
    if (m.ruleId === "react-refresh/only-export-components") {
      if (!code.startsWith("/* eslint-disable react-refresh/only-export-components */")) {
        code = `/* eslint-disable react-refresh/only-export-components */\n${code}`;
        changed = true;
      }
    }
  }
  if (changed) {
    writeFileSync(f.filePath, code);
    console.log("FIX", f.filePath);
  }
}
console.log("OK");
