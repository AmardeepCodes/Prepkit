
import { readFileSync, writeFileSync } from "fs";
import { connectDB } from "../src/config/db.js";
import { runKitPipeline } from "../src/services/pipeline/kitPipeline.js";
import { validateKitStructure } from "../src/services/validation/kitSchemaValidator.js";

// npm run evaluate -- --input cases.json --output kits.json
//
// Runs the exact same pipeline the API route uses (src/services/pipeline/kitPipeline.js)
// against a batch of cases, and writes results in the Appendix B shape.
// A failing case is recorded, not thrown — the whole run must complete
// even if one company site is unreachable.
//
// Manual arg parsing instead of node:util's parseArgs — that one throws on
// any argument it doesn't recognize, which made it brittle across how
// different shells (PowerShell included) forward flags through `npm run`.


function getArg(name) {
  const flag = `--${name}`;

  // Normal case: node script.js --input foo.json
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];

  const inline = process.argv.find((a) => a.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);

  // npm's `npm run x -- --input foo.json` converts `--input foo.json` into
  // an npm config value instead of forwarding it as a literal CLI arg on
  // some npm/Windows combinations — it shows up as this env var instead.
  const envVar = process.env[`npm_config_${name}`];
  if (envVar) return envVar;

  return undefined;
}



const inputPath = getArg("input");
const outputPath = getArg("output");

if (!inputPath || !outputPath) {
  console.error("Usage: npm run evaluate -- --input cases.json --output kits.json");
  console.error("Received argv:", process.argv.slice(2));
  process.exit(1);
}

async function run() {
  await connectDB();

const cases = JSON.parse(readFileSync(inputPath, "utf-8"));
  if (!Array.isArray(cases)) {
    console.error("Input file must be a JSON array of cases.");
    process.exit(1);
  }

  const kits = [];

 for (const testCase of cases) {
  const { id, jd, company_url, days } = testCase;
  console.log(`[evaluate] running case ${id}...`);

  try {
    const kit = await runKitPipeline({ jd, companyUrl: company_url, days });

    // Same validation gate the single-kit API route uses - not a parallel
    // implementation, just the same check called from the batch entry
    // point too.
    const { valid, errors } = validateKitStructure(kit);
    if (!valid) {
      kits.push({
        id,
        status: "failed",
        kit: null,
        error: { code: "INVALID_KIT_STRUCTURE", message: errors.join("; ") },
      });
      console.error(`[evaluate] case ${id} -> failed structure validation: ${errors.join("; ")}`);
      continue;
    }

    kits.push({ id, status: "ok", kit, error: null });
    console.log(`[evaluate] case ${id} -> ok`);
  } catch (err) {
    kits.push({
      id,
      status: "failed",
      kit: null,
      error: { code: err.code || "PIPELINE_ERROR", message: err.message },
    });
    console.error(`[evaluate] case ${id} -> failed: ${err.message}`);
  }
}

  const output = {
    version: "1.0",
    generated_at: new Date().toISOString(),
    kits,
  };

writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`[evaluate] wrote ${kits.length} results to ${outputPath}`);
  
  process.exit(0);
}

run().catch((err) => {
  console.error("[evaluate] fatal error:", err);
  process.exit(1);
});