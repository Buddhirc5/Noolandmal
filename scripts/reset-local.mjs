// Resets the local demo store (re-seeded on next request). Usage: npm run seed
import fs from "node:fs";
import path from "node:path";
const dir = process.env.DATA_DIR || ".data";
fs.rmSync(path.join(dir, "db.json"), { force: true });
fs.rmSync(path.join(dir, "storage"), { recursive: true, force: true });
console.log(`Local store in ${dir} cleared — it re-seeds from data/seed.ts on the next request.`);
