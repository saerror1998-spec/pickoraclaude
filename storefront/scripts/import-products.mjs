// One-off bulk import: reads the source CSV catalog + a folder of product
// images, uploads images to Supabase Storage, and upserts rows into
// public.products (keyed by sku so re-runs are safe).
//
// Requires supabase/migrations/002_add_sku_spec_text.sql to have been run
// first (adds the unique sku column this script upserts on).
//
// Usage:
//   node --env-file=.env.local scripts/import-products.mjs <csvPath> <imagesDir> [--limit=N]
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env
// (service role bypasses RLS for the bulk insert + storage upload).

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";

function parseArgs() {
  const args = process.argv.slice(2);
  const positional = args.filter((a) => !a.startsWith("--"));
  const limitArg = args.find((a) => a.startsWith("--limit="));
  return {
    csvPath: positional[0],
    imagesDir: positional[1],
    limit: limitArg ? parseInt(limitArg.split("=")[1], 10) : null,
  };
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c === "\r") {
        // skip
      } else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BRAND_PATTERNS = [
  { brand: "Dell", re: /\bdell\b/i },
  { brand: "Lenovo", re: /\blenovo\b/i },
  { brand: "HP", re: /\bhp\b|elitebook|probook|zbook|z-book/i },
];

function extractBrand(title) {
  for (const { brand, re } of BRAND_PATTERNS) {
    if (re.test(title)) return brand;
  }
  return title.trim().split(/\s+/)[0] || "Unknown";
}

const STORAGE_KEYWORD_RE = /ssd|hdd|emmc/i;
const SIZE_TOKEN_RE = /(\d+(?:\.\d+)?)\s*(GB|TB)/gi;

function sumSizesToGb(text) {
  let total = 0;
  let match;
  SIZE_TOKEN_RE.lastIndex = 0;
  while ((match = SIZE_TOKEN_RE.exec(text)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    total += unit === "TB" ? value * 1024 : value;
  }
  return Math.round(total);
}

const PROCESSOR_RE = /(core\s*i[3579][^,/]*|celeron[^,/]*|pentium[^,/]*|ryzen\s*\d[^,/]*|xeon[^,/]*|core\s*2\s*duo[^,/]*)/i;

function extractProcessorFromTitle(title) {
  const m = title.match(PROCESSOR_RE);
  return m ? m[0].trim() : "Not specified";
}

/**
 * Parses the source catalog's inconsistent "Subtitle" spec line into
 * {ramGb, storageGb, processor}. Observed shapes:
 *  - 3 parts: "8GB / 128GB + 1TB HDD / i3/10th"        -> [ram, storage, processor]
 *  - 2 parts: "256 GB SSD / 8 GB"                        -> [storage, ram] (processor comes from Title)
 *  - 1 part or unrecognized: best-effort fallback
 */
function parseSpec(subtitle, title) {
  const parts = subtitle.split(" / ").map((p) => p.trim());

  if (parts.length === 3) {
    return {
      ramGb: sumSizesToGb(parts[0]) || 0,
      storageGb: sumSizesToGb(parts[1]) || 0,
      processor: parts[2] || extractProcessorFromTitle(title),
    };
  }

  if (parts.length === 2) {
    const [a, b] = parts;
    const aIsStorage = STORAGE_KEYWORD_RE.test(a);
    const storagePart = aIsStorage ? a : b;
    const ramPart = aIsStorage ? b : a;
    return {
      ramGb: sumSizesToGb(ramPart) || 0,
      storageGb: sumSizesToGb(storagePart) || 0,
      processor: extractProcessorFromTitle(title),
    };
  }

  return {
    ramGb: 0,
    storageGb: sumSizesToGb(subtitle) || 0,
    processor: extractProcessorFromTitle(title),
  };
}

function extractCondition(description) {
  const m = description.match(/Condition\s*:\s*Grade\s*([A-C])/i);
  if (!m) return "Good";
  return { A: "Excellent", B: "Good", C: "Fair" }[m[1].toUpperCase()] ?? "Good";
}

function extractCompatibility(title) {
  if (/chromebook/i.test(title)) return ["ChromeOS"];
  if (/\bmac(book)?\b/i.test(title)) return ["macOS"];
  return ["Windows"];
}

async function uploadImage(supabase, sku, filePath) {
  const ext = path.extname(filePath) || ".jpg";
  const storageKey = `${sku}${ext}`;
  const fileBuffer = fs.readFileSync(filePath);
  const contentType =
    { ".png": "image/png", ".webp": "image/webp" }[ext.toLowerCase()] ?? "image/jpeg";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, fileBuffer, { contentType, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storageKey);
  return data.publicUrl;
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function runOne() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      try {
        results[i] = { ok: true, value: await worker(items[i], i) };
      } catch (error) {
        results[i] = { ok: false, error, item: items[i] };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runOne));
  return results;
}

async function main() {
  const { csvPath, imagesDir, limit } = parseArgs();
  if (!csvPath || !imagesDir) {
    console.error("Usage: node --env-file=.env.local scripts/import-products.mjs <csvPath> <imagesDir> [--limit=N]");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
    process.exit(1);
  }
  const supabase = createClient(url, serviceRoleKey);

  const raw = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);
  const header = rows[0];
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  let dataRows = rows.slice(1).filter((r) => r.length === header.length && r.some((c) => c.trim() !== ""));
  if (limit) dataRows = dataRows.slice(0, limit);

  console.log(`Ensuring storage bucket "${BUCKET}" exists (public)...`);
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw error;
  }

  console.log(`Uploading ${dataRows.length} images...`);
  const uploadResults = await runWithConcurrency(dataRows, 8, async (row) => {
    const sku = row[idx.sku];
    const imagePath = path.join(imagesDir, row[idx.image_link]);
    return uploadImage(supabase, sku, imagePath);
  });

  const uploadFailures = uploadResults.filter((r) => !r.ok);
  if (uploadFailures.length > 0) {
    console.error(`${uploadFailures.length} image uploads failed:`);
    uploadFailures.slice(0, 10).forEach((f) => console.error(" -", f.item[idx.sku], f.error?.message));
  }

  console.log("Building product rows...");
  const productRows = dataRows.map((row, i) => {
    const title = row[idx.Title];
    const subtitle = row[idx.Subtitle];
    const description = row[idx.Description];
    const sku = row[idx.sku];
    const price = parseFloat(row[idx.price]);
    const discount = parseFloat(row[idx.discount]) || 0;
    const { ramGb, storageGb, processor } = parseSpec(subtitle, title);

    const uploadResult = uploadResults[i];
    const image = uploadResult.ok ? uploadResult.value : null;

    return {
      // Truncate only the title portion — slicing the combined string could
      // clip off the sku suffix and collide two different products' slugs
      // (this happened: 200 rows failed a unique-constraint upsert on the
      // first import run before this fix).
      slug: `${slugify(title).slice(0, 150)}-${slugify(sku)}`,
      name: title,
      brand: extractBrand(title),
      image,
      processor,
      ram_gb: ramGb,
      storage_gb: storageGb,
      price_cents: Math.round(price * 100),
      original_price_cents: discount > 0 ? Math.round((price / (1 - discount / 100)) * 100) : null,
      compatibility: extractCompatibility(title),
      condition: extractCondition(description),
      in_stock: true,
      sku,
      spec_text: subtitle,
    };
  }).filter((row) => row.image !== null); // skip rows whose image upload failed

  console.log(`Upserting ${productRows.length} product rows...`);
  const CHUNK = 200;
  for (let i = 0; i < productRows.length; i += CHUNK) {
    const chunk = productRows.slice(i, i + CHUNK);
    const { error } = await supabase.from("products").upsert(chunk, { onConflict: "sku" });
    if (error) {
      console.error(`Upsert failed for chunk starting at ${i}:`, error.message);
    } else {
      console.log(`  upserted ${i + chunk.length}/${productRows.length}`);
    }
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
