// verify_manifest.ts
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { opendiscord } = require(path.join(process.cwd(), "src", "core", "startup", "init.ts"));

// ----------------- TYPES -----------------
interface ManifestEntry {
  path: string;
  size: number;
  mtimeMs: number;
  hash: string;
}

interface Manifest {
  root: string;
  files: ManifestEntry[];
}

interface Mismatch {
  path: string;
  reason: "missing" | "size" | "hash";
}

// ----------------- HELPERS -----------------
function fileHashSync(filePath: string): string {
  const hash = crypto.createHash("sha256");
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest("hex");
}

// ----------------- VERIFY FUNCTION -----------------
function verifyManifest(manifestPath: string): Mismatch[] {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found: ${manifestPath}`);
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const root = manifest.root || process.cwd();

  const mismatches: Mismatch[] = [];

  for (const f of manifest.files) {
    const fullPath = path.join(root, f.path);

    if (!fs.existsSync(fullPath)) {
      mismatches.push({ path: f.path, reason: "missing" });
      continue;
    }

    const stat = fs.statSync(fullPath);

    if (stat.size !== f.size) {
      mismatches.push({ path: f.path, reason: "size" });
      continue;
    }

    const hash = fileHashSync(fullPath);
    if (hash !== f.hash) {
      mismatches.push({ path: f.path, reason: "hash" });
      continue;
    }
  }

  return mismatches;
}

// ----------------- CLI -----------------
function vermann() {
  // Default manifest path in tempDetection folder
  const manifestFile = process.argv[2] || path.join("tempDetection", "manifest.json");

  if (!fs.existsSync(manifestFile)) {
    opendiscord.log(`Manifest file not found: ${manifestFile}`, 'error');
    process.exit(1);
  }

  try {
    const mismatches = verifyManifest(manifestFile);

    if (mismatches.length === 0) {
      opendiscord.log("✅ All files verified successfully!", 'system');
    } else {
      opendiscord.log("⚠️  Mismatches found:", 'error');
      for (const m of mismatches) {
        console.warn(`- ${m.path}: ${m.reason}`);
      }
      process.exit(2);
    }
  } catch (err) {
    console.error("Error verifying manifest:", err);
    process.exit(3);
  }
}
