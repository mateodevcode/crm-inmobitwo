// scripts/lint-report.mjs — lista errores eslint de src/ (uso puntual fase 0.4)
import { execSync } from "node:child_process";

const out = execSync("npx eslint src/ --format json", {
  encoding: "utf8",
  maxBuffer: 1 << 20,
});
const data = JSON.parse(out);
for (const f of data) {
  if (!f.messages.length) continue;
  console.log(f.filePath);
  for (const m of f.messages) {
    console.log(`  ${m.line}:${m.column} ${m.ruleId} :: ${String(m.message).split("\n")[0]}`);
  }
}
