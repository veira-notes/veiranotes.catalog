# Affiliate Catalog Website

Lightweight catalog of promoted Shopee products; each listing links to Shopee via an affiliate link.

## Phase 1 checklist

- [ ] Stack and hosting chosen — see Open Question #5
- [ ] Project scaffolded
- [ ] Runs locally
- [ ] Basic product listing structure defined (fields: _TBD_)

## Notes

- Stack: Astro 7.4.4 static site (needs Node.js 22.23.4 or newer; this PC uses Node.js 24.22.2 LTS). Sheet reader: `src/lib/sheet.ts`. Sources: [Astro environment variables](https://docs.astro.build/en/guides/environment-variables/), [Node.js releases](https://nodejs.org/en/about/previous-releases)
- Hosting: Cloudflare Pages free plan, live at https://veiranotes.pages.dev (set up 30 October 2026, PRD 1.6). Pages project `veiranotes`, connected to the private GitHub repo `veira-notes/veiranotes.catalog`, branch `main`. Build settings: root directory `website`, build command `npm run build`, output directory `dist`. Node.js version comes from `website/.node-version`. Build variables: `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`, `GOOGLE_SERVICE_ACCOUNT_KEY` (the key's JSON content, stored as an encrypted secret; set only in Cloudflare, never in the repo). Confirmed 30 October 2026: encrypted variables do reach the Pages build. The setup screen has no Encrypt option, so add the key afterwards under Settings → Variables and Secrets, then retry the deployment. Every push to `main` rebuilds and redeploys the site automatically. Source: [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- Design: see `DESIGN_BRIEF.md`. Site text, intro and social links: `src/lib/site.ts`. Colours and fonts: `src/styles/theme.css`. Page: `src/pages/index.astro`. Fonts (Cormorant Garamond, Jost; OFL licence) and social icons (Simple Icons; CC0) are free npm packages served from the site itself.
- Run locally: copy `.env.example` to `.env` and fill it in, then in this folder run `npm install` once and `npm run dev`. Open http://localhost:4321. Rows that are skipped are listed in the terminal.

## Update flow: the Publish site button (PRD 1.7)

- **Where:** in the product workbook, menu **Catalogue → Publish site**. The script is a Google Apps Script bound to the workbook (Extensions → Apps Script). A copy is kept in `apps-script/Code.gs`, without secrets.
- **What it does:** remembers which rows are "Need to Publish", triggers a Cloudflare Pages rebuild through a deploy hook, then checks the build every 10 seconds. Only when the build is deployed does it change those rows to "Published" and write the date and time in **Published On**, as `yyyy-MM-dd HH:mm` in Jakarta time (UTC+7), e.g. `2026-11-02 20:53`. If the build fails or times out, no status changes. Messages appear as notices in the bottom-right corner of the sheet, never as pop-ups that wait for a click.
- **Time limit:** Google stops any script run after 6 minutes ("Exceeded maximum execution time"). The script keeps the whole run under 4.5 minutes. An earlier version ended with a pop-up that waited for an OK click; on 2 November 2026 an unanswered pop-up made a run hit the limit, so pop-ups were removed.
- **Logs:** in the workbook, open **Extensions → Apps Script → Executions** and click a run. Each step is logged with the seconds since the start: who ran it, which script properties are set (never their values), how many products have each status, the products to be newly listed (e.g. `VN13 – Product name (row 14)`) and any incomplete rows, Cloudflare's reply, each build stage, and the products newly listed and marked "Published" with their time. The final notice in the sheet also names the newly listed products (e.g. VN13, VN14). Use the log first when a publish looks wrong. Logging who ran it needs one extra permission the first time.
- **Changes since the last publish:** after each successful publish, the script saves what the site shows in a hidden tab, **"_Site Snapshot"** (Product ID, No, Product Name, Image URL, Category, Shopee Affiliate Link, Saved At). The next publish compares against it and logs every product **added**, **removed** (e.g. archived, or now incomplete) and **changed**, with what changed: number, name, image, category or Shopee link (e.g. `Changed: VN2 – Polka bag: name "…" → "…"; image changed`). The final notice gives the counts. No database or paid service is needed.
  - The first publish after this was added only saves the snapshot; changes are listed from the publish after that.
  - Products are matched by **Product ID**, so changing a product's ID shows as one removed and one added product.
  - Short Description, Status and Published On aren't compared, because the site doesn't show them as product details.
  - If a build fails or times out, the snapshot isn't updated, so the next publish still compares with the last version that went live.
  - Don't edit the "_Site Snapshot" tab by hand. To see it: **View → Hidden sheets**. Deleting it is safe; the next publish starts a new one.
- **Updating the script:** `apps-script/Code.gs` in this repo is the reference copy. After a change, paste it over `Code.gs` in the Apps Script editor and save; the Script Properties stay as they are.
- **What each rebuild shows:** every "Published" and "Need to Publish" product; "Archived" and other statuses are left out. Rows missing No, Product ID, Product Name or Shopee Affiliate Link are skipped by the site and are not marked Published.
- **"New" badge:** shows for 14 days from the day a product is published. The site stores each product's publish date and time (its Published On value, or the build time for a product being published in that build, because the button writes Published On only after the build). The day sets the badge; the full time sets the order among "New" products. The visitor's browser compares that date with today, so the badge appears on the first build and disappears on time without a rebuild. Visitors with JavaScript turned off see no badges.
- **Common cases:**
  - *Changing a Published On date by hand* (for example, from 1 January 2026 to 1 November 2026): after the next rebuild, the site uses the new date, so the product shows "New" until 14 days after it. Changing the date alone doesn't update the site: press **Publish site**, which rebuilds even when no row is "Need to Publish". Type it as **yyyy-mm-dd HH:mm** (e.g. 2026-11-01 09:30, Jakarta time), the format the button writes; the time is optional (2026-11-01 is read as 00:00). `11/1/2026` is read day first (11 January), and words such as `1 Nov 2026` aren't recognised, so the product gets no badge.
  - *Re-publishing an archived product:* set it to "Need to Publish" and press **Publish site**. The build ignores its old Published On date and counts it from the build day, so it shows "New" straight away. After the build succeeds, the button sets it to "Published" and overwrites Published On with the current date and time.
  - *Product images:* paste the image link in any form Shopee gives (plain, ending in `.webp`, or ending in `@resize_w900_nl.webp`). The site loads Shopee's small thumbnail (`<host>/file/<image id>_tn`, about 10–40 KB) built from the image id. If the thumbnail fails, it loads the pasted link instead; if that fails too (for example, the seller removed the photo, or the link was pasted wrongly), the row shows the "v" placeholder. A product showing the placeholder needs a new image link in the sheet, then **Publish site**.
  - *Product numbers:* the site never creates numbers. It shows "VN" plus the **No** column, so an archived product that is re-published keeps its original number (e.g. VN12) unless you change No.
  - *Order on the page:* products with the "New" badge are shown first, most recently published at the top by date and time (same time: higher number first), then all others by number, highest first. So a re-published product goes to the top while it is "New", keeps its number, and drops back to its number position when the badge expires. The browser does this sorting; with JavaScript turned off, the list is in number order.
- **Secrets:** the deploy hook link and a Cloudflare API token (Account → Cloudflare Pages → Read only) are kept in the script's **Script Properties**: `CF_DEPLOY_HOOK_URL`, `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `CF_PROJECT_NAME`. Never put them in the sheet, docs or repo. Anyone with the deploy hook link can trigger builds; if it leaks, delete the hook in Cloudflare and make a new one.
- **Sources:** [Pages deploy hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/), [Get a Pages deployment (API)](https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/deployments/methods/get/)

## Product sheet (PRD 1.3) – set up 29 October 2026

- **Where:** tab `Product Sheet` in your private Google Sheets workbook. The spreadsheet ID lives in `website/.env` (set up in 1.4), not in this README.
- **Columns the site uses:** Product ID, Product Name, Image URL, Category, Short Description, Shopee Affiliate Link, Status. The site ignores No, Price and "as per (date)".
- **Status values:** On Research, Selected/Curated, Content Ready, Need to Publish, Published, Archived. The site shows only "Need to Publish" and "Published".
- **Access:** the sheet is shared as Viewer with a Google service account (`sheet-reader`, in the Google Cloud project `affiliate-catalogue`). Its JSON key is stored outside the project at `C:\Users\jefersono\.secrets\affiliate-sheet-reader.json`. Never commit it; `.gitignore` also blocks `secrets/` and `*service-account*.json`. Google shares whole files, so this account can read every tab in the workbook. That's accepted for now (see PRD Risks).
- **Cost:** standard use of the Sheets API costs nothing (USD 0). The read limit is 300 requests a minute per project, and one build uses one request. Google says charges for going over the limits are expected later in 2026. Source: [Google Sheets API usage limits](https://developers.google.com/workspace/sheets/api/limits)
- **Key creation:** organisations created on or after 3 May 2024 block service account keys by default. A personal Google account is not affected. Source: [Create and delete service account keys](https://docs.cloud.google.com/iam/docs/keys-create-delete)

## Rules check (PRD 1.2) – checked 28 October 2026

### 1. Does Cloudflare Pages' free plan allow an affiliate site?

**Answer: yes.** No Cloudflare term bans commercial or affiliate sites on the free plan.

- The Self-Serve Subscription Agreement (last updated 12 September 2025) bans illegal content, malware, phishing, spam, reselling access and proxy or VPN services (sections 2.2.1 and 2.7). It has no ban on commercial or affiliate use.
- Free plans can be ended by Cloudflare at its own discretion, with no liability (section 2.6). You may not process or collect card payments on a free-plan site (section 2.2.1(h)). We don't do either, because buyers pay on Shopee.
- The Service-Specific Terms (last updated 28 September 2026) say free CDN users must not serve video or a "disproportionate percentage of pictures" or other large files without a paid service. Our product images load from Shopee's own image servers, not from Cloudflare, so this doesn't apply. Keep it that way: don't upload product photos into the site.
- Free plan limits: 500 builds a month, 1 build at a time, 20,000 files per site, 25 MiB per file, 100 custom domains per project. The limits page gives no bandwidth figure for static files. These cost nothing (USD 0).

Sources:
- [Cloudflare Self-Serve Subscription Agreement](https://www.cloudflare.com/terms/)
- [Cloudflare Service-Specific Terms – Application Services](https://www.cloudflare.com/service-specific-terms-application-services/)
- [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)

### 2. Do Shopee Affiliate terms allow your links and product photos on your own website?

**Answer: links yes, with conditions; product photos unclear.**

Source: *Syarat dan Ketentuan Program Afiliasi Shopee untuk Individu* (Shopee Affiliate Program Terms for Individuals, Indonesia), last updated 22 October 2026. Clause numbers below refer to this page.

- **Websites are allowed, but only after Shopee approves them.** Promotion media include social media and websites, including blogs, "setelah disetujui oleh Shopee" (after Shopee approves them) (clauses 1.10 and 2.7). Participant media must be registered by the affiliate and approved by Shopee. The terms don't explain how to register a website.
- **No Shopee name, trademark or logo on the website.** Approved media "tidak mengandung merek dagang, nama atau logo Shopee" (must not contain Shopee's trademarks, name or logo) (clause 2.7(i)). Promotions must not imitate or resemble Shopee's identity (clause 6.3(q)). This affects the planned 'Buy on Shopee' button in PRD 1.5.
- **Affiliate links:** Shopee grants a revocable licence to show your affiliate links on your approved media. You may not change them or make derivatives of Shopee's intellectual property without written consent (clause 2.6).
- **Product photos: not addressed.** No clause allows or bans reusing a seller's product photos on an affiliate's own website. The terms grant no right to use Shopee's intellectual property beyond the affiliate links (clause 2.6). Automated scraping of Shopee's logos, key visuals or creative materials is banned (clause 6.3(i)). Sellers must hold the rights to the content in their listings (clause 7.2(b)).
- **Other rules that matter for this site:** no paid ads or bidding on the "Shopee" brand keyword without written consent (clauses 6.2(f), 6.3(h) and 6.3(n)), and no misleading content or clicks (clauses 6.4 and 7.1).

Source:
- [Syarat dan Ketentuan Program Afiliasi Shopee untuk Individu](https://help.shopee.co.id/portal/4/article/71217-Syarat-dan-Ketentuan-Program-Afiliasi-Shopee-untuk-Individu)

### Decision (29 October 2026)

- **Images:** the site shows the product's first image on Shopee, using the image link you paste into the sheet. Nothing is copied or scraped. On Shopee's own "My Collection" page (collshp.com), the image shown is the product's first image (checked on one product). Automated reading of product pages is not an option: Shopee's terms ban it (clause 6.3(i)), and the product page sent our test visit to a login check.
- **Branding:** no Shopee name, trademark or logo on the site. The button says "View product".
- **Still to confirm with Shopee support:** how to get the website approved as a promotion channel (needed before PRD 1.8), and whether affiliates may show product images on their own website. If the answer on images is no, fall back to your own photos or no images.

**Update 2 November 2026 (PRD 1.8):** Shopee approved https://veiranotes.pages.dev as a promotion channel (your report). The site is linked in the Instagram and Threads bios; the TikTok bio link waits until the account has 1,000 followers or a business account. Shopee's answer on showing product images on your own site isn't recorded here yet; the PRD risk stays open until it is.

**Status:** 1.2 closed on 29 October 2026. The open Shopee questions are tracked in PRD 1.8 and the Risks list.
