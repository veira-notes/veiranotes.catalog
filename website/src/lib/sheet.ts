// Reads the product list from the private Google Sheet at build time,
// signing in as the read-only service account.
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import {
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_TAB,
  GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
  GOOGLE_SERVICE_ACCOUNT_KEY,
} from "astro:env/server";

export type Product = {
  no: number;
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  description: string;
  link: string;
  status: string;
  publishedOn: Date | null;
};

export type SkippedRow = { row: number; reason: string };

// Only these statuses appear on the site.
const VISIBLE_STATUSES = ["need to publish", "published"];

// Sheet header → field. Matching ignores case and extra spaces.
const COLUMNS = {
  no: "No",
  id: "Product ID",
  name: "Product Name",
  imageUrl: "Image URL",
  category: "Category",
  description: "Short Description",
  link: "Shopee Affiliate Link",
  status: "Status",
} as const;

// Filled in by the publish button (PRD 1.7); the site works without it.
const PUBLISHED_ON = "Published On";

type ServiceAccountKey = { client_email: string; private_key: string };

function loadKey(): ServiceAccountKey {
  if (GOOGLE_SERVICE_ACCOUNT_KEY) return JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY);
  if (GOOGLE_SERVICE_ACCOUNT_KEY_FILE) return JSON.parse(readFileSync(GOOGLE_SERVICE_ACCOUNT_KEY_FILE, "utf8"));
  throw new Error("No service account key: set GOOGLE_SERVICE_ACCOUNT_KEY_FILE or GOOGLE_SERVICE_ACCOUNT_KEY.");
}

async function getAccessToken(key: ServiceAccountKey): Promise<string> {
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    b64({ alg: "RS256", typ: "JWT" }) +
    "." +
    b64({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 600,
    });
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Google sign-in failed: ${data.error} ${data.error_description ?? ""}`);
  return data.access_token;
}

const clean = (v: unknown) => String(v ?? "").trim();

// Accepts 2026-10-29 or 29/10/2026 (day first, as Indonesian sheets show it).
function parseDate(v: string): Date | null {
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  return null;
}

export async function loadProducts(): Promise<{ products: Product[]; skipped: SkippedRow[] }> {
  const token = await getAccessToken(loadKey());
  const range = encodeURIComponent(`'${GOOGLE_SHEET_TAB}'!A1:Z`);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${range}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Could not read the sheet (${res.status}): ${data.error?.message}`);

  const [header = [], ...rows]: string[][] = data.values ?? [];
  const index = Object.fromEntries(
    Object.entries(COLUMNS).map(([field, title]) => {
      const i = header.findIndex((h) => clean(h).toLowerCase() === title.toLowerCase());
      if (i === -1) throw new Error(`Column "${title}" not found in tab "${GOOGLE_SHEET_TAB}".`);
      return [field, i];
    }),
  ) as Record<keyof typeof COLUMNS, number>;
  const publishedOnCol = header.findIndex((h) => clean(h).toLowerCase() === PUBLISHED_ON.toLowerCase());

  const products: Product[] = [];
  const skipped: SkippedRow[] = [];
  const seenIds = new Set<string>();
  const seenNos = new Set<number>();

  rows.forEach((r, i) => {
    const row = i + 2; // sheet row number, after the header
    const v = Object.fromEntries(
      Object.entries(index).map(([field, col]) => [field, clean(r[col])]),
    ) as Record<keyof typeof COLUMNS, string>;

    if (!v.id && !v.name && !v.link) return; // empty row
    if (!VISIBLE_STATUSES.includes(v.status.toLowerCase())) return; // not for the site

    const missing = [
      !/^\d+$/.test(v.no) && "No (a whole number)",
      !v.id && "Product ID",
      !v.name && "Product Name",
      !v.link && "Shopee Affiliate Link",
    ].filter(Boolean);
    if (missing.length) return void skipped.push({ row, reason: `missing ${missing.join(", ")}` });
    const no = Number(v.no);
    if (seenNos.has(no)) return void skipped.push({ row, reason: `duplicate No ${no}` });
    if (seenIds.has(v.id)) return void skipped.push({ row, reason: `duplicate Product ID ${v.id}` });

    seenNos.add(no);
    seenIds.add(v.id);
    products.push({
      ...v,
      no,
      publishedOn: publishedOnCol === -1 ? null : parseDate(clean(r[publishedOnCol])),
    });
  });

  for (const s of skipped) console.warn(`[sheet] Skipped row ${s.row}: ${s.reason}`);
  products.sort((a, b) => b.no - a.no); // newest first
  return { products, skipped };
}
