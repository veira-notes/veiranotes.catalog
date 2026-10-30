# Affiliate Catalog Website

Lightweight catalog of promoted Shopee products; each listing links to Shopee via an affiliate link.

## Phase 1 checklist

- [ ] Stack and hosting chosen — see Open Question #5
- [ ] Project scaffolded
- [ ] Runs locally
- [ ] Basic product listing structure defined (fields: _TBD_)

## Notes

- Stack: Astro 7.4.4 static site (needs Node.js 22.23.4 or newer; this PC uses Node.js 24.22.2 LTS). Sheet reader: `src/lib/sheet.ts`. Sources: [Astro environment variables](https://docs.astro.build/en/guides/environment-variables/), [Node.js releases](https://nodejs.org/en/about/previous-releases)
- Hosting: Cloudflare Pages free plan (set up in PRD 1.6)
- Design: see `DESIGN_BRIEF.md`. Site text, intro and social links: `src/lib/site.ts`. Colours and fonts: `src/styles/theme.css`. Page: `src/pages/index.astro`. Fonts (Cormorant Garamond, Jost; OFL licence) and social icons (Simple Icons; CC0) are free npm packages served from the site itself.
- Run locally: copy `.env.example` to `.env` and fill it in, then in this folder run `npm install` once and `npm run dev`. Open http://localhost:4321. Rows that are skipped are listed in the terminal.

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

**Status:** 1.2 closed on 29 October 2026. The open Shopee questions are tracked in PRD 1.8 and the Risks list.
