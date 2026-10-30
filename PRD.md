# Automated Shopee Affiliate Marketing Ecosystem – PRD

## 1. Status
**Status:** Approved · **Current:** Phase 1.7 (in progress) · **Updated:** 2026-10-30
Catalogue website online first, then the core automation tools → see PROJECT_CONTEXT.md
**Now:** The project folder is set up (2026-10-24). Claude Code CLI is installed, and it loads CLAUDE.md, PROJECT_CONTEXT.md and PRD.md at session start (1.1, 2026-10-28). The Shopee Affiliate account is approved and active. Hosting and Shopee rules checked (1.2, 2026-10-29); Shopee still has to approve the website before it goes in your bios. The private product sheet holds 3 products and a Google service account can read it (1.3, 2026-10-29). The Astro site (7.4.4) is scaffolded in `website/` and reads the sheet locally (1.4, 2026-10-29), and the veiranotes catalogue design is built and approved (1.5, 2026-10-29); Node.js 24.22.2 LTS is installed in `AppData\Local\Programs\nodejs`, ahead of Hermes' bundled Node on the user PATH. Hermes Agent CLI (v0.18.0) was already installed before this plan; the Hermes Desktop install failed and is checked in Phase 3. The website is live at https://veiranotes.pages.dev, built by Cloudflare Pages from the private GitHub repo `veira-notes/veiranotes.catalog` (1.6, 2026-10-30). Hermes Desktop, n8n and the tunnel are not set up yet.

## 2. Approach
- **Stack:** Website: Astro static site (proposed) that reads a private Google Sheet at build time through a free Google service account (proposed), code in a private GitHub repo (proposed) · Hermes Desktop on native Windows (includes Hermes Agent), running on OpenRouter free models · Claude Code CLI reached through Hermes' claude-code skill (proposed; confirmed in 2.1 and 3.4) · n8n Community Edition in Docker Desktop with Docker Compose (proposed) · ngrok for HTTPS webhooks (evaluated in 5.1).
- **Hosting:** Website on Cloudflare Pages' free plan with a free `*.pages.dev` address (proposed; terms checked in 1.2). Hermes and n8n on this Windows PC.
- **Key choices:** Website first, built in Claude Code; rebuild from the sheet on a button press; Claude is not Hermes' main model, and Hermes hands coding work to the local Claude Code CLI instead (proposed). Reasons live in the context doc's Decisions log.

## 3. Phases

### Phase 1 – Catalogue website online ⏳
Goal: A live catalogue you fill from a Google Sheet, linked in your bios. · Covers: R1, R2 · Est: ~2 days
- [x] 1.1 Hand over to Claude Code: put PROJECT_CONTEXT.md, PRD.md and a new CLAUDE.md (pointing to both docs, plus a short version of this Project's instructions) in the folder root – done when: in Claude Code, `/context` lists CLAUDE.md under Memory files, and Claude Code names the current sub-phase from the PRD.
- [x] 1.2 Check the rules: Cloudflare Pages' free plan allows an affiliate site, and Shopee Affiliate terms allow your links and product photos on your own website – done when: both answers, with official sources, are in `website/README.md`. If either is no, stop and choose an alternative together. Result (2026-10-29): Cloudflare yes. Shopee links yes, if Shopee approves the website (checked in 1.8) and the site shows no Shopee name or logo. Product images: the terms are silent; we show Shopee's own image link, pasted by hand, and ask Shopee support to confirm.
- [x] 1.3 Create the private product sheet: tab 'Product Sheet' in your existing workbook, with these columns: No, Product ID, Product Name, Image URL (link to the product's first image on Shopee, pasted by hand), Price, as per (date), Category, Short Description, Shopee Affiliate Link, Status (dropdown: On Research, Selected/Curated, Content Ready, Need to Publish, Published, Archived). The site ignores No, Price and 'as per (date)'. Share it read-only with a Google service account, not publicly – done when: the sheet holds 3 real products and the service account can read it. The sheet is not published to the web. Verified 2026-10-29: read test from this PC returned the 3 products (VN00001–VN00003), all 'Need to Publish'.
- [x] 1.4 Scaffold the site in `website/` (install Node.js LTS first if missing) and read the 'Product Sheet' tab through the service account (key kept in `.env` locally and in Cloudflare's build settings). Show only rows with Status 'Need to Publish' or 'Published', and skip any row with a missing Product ID, name or Shopee link, or a duplicate Product ID – done when: the local dev server shows the 3 products, and a test row with no link is skipped without breaking the page. Verified 2026-10-29: the dev server showed VN00001–VN00003, and test row 5 was skipped ('missing Shopee Affiliate Link') with the page intact.
- [x] 1.5 Build the catalogue page. First agree a one-page design brief with you (site name without 'Shopee', look and feel, colours, reference sites, how visitors browse; your 'Brand Identity' tab may be used with your permission), then build it to `website/DESIGN_BRIEF.md`: a collection-style list, newest first by No, with search and category tabs at the top. Each product row shows its image, number ('VN' + No, e.g. VN25), name and a 'New' badge where it applies, and the whole row opens the product. No price, and no Shopee name, trademark or logo anywhere on the site (Shopee terms, clause 2.7(i)); a missing image shows a placeholder – done when: you approve the design brief, in a phone-sized browser view every product displays correctly and every button opens the right Shopee product, the page shows no test or debug text (such as product counts or skipped rows; skipped rows are reported only in the build log), and you approve the look from a phone-size screenshot (the check on your own phone happens in 1.6, once the site is online). Verified 2026-10-29: phone-size (390 px) checks of layout, search, tabs, back-to-top and all 3 product links passed; no price, 'Shopee' wording or debug text; you approved the screenshot.
- [x] 1.6 Put it online: push to a private GitHub repo and connect it to Cloudflare Pages – done when: the live `*.pages.dev` address loads on your phone over mobile data, and you're happy with how the design looks on your phone. Undo: delete the Cloudflare Pages project and the site goes offline. Verified 2026-10-30: https://veiranotes.pages.dev loads on your phone over mobile data and you approved the design; from here, all 3 products, images, tabs and affiliate links worked over HTTPS with no secrets or debug text in the page. The key is an encrypted Cloudflare secret.
- [ ] 1.7 Set up the update flow: a menu button in the sheet (Google Apps Script) triggers a Cloudflare rebuild. Each rebuild shows every 'Published' and 'Need to Publish' product and removes every 'Archived' product. When Cloudflare reports the build succeeded, the script changes the rows that were 'Need to Publish' at the button press to 'Published' and writes today's date in a new 'Published On' column (the site shows a 'New' badge for 14 days after it); if the build fails, no status changes and you see a message. The trigger link and the Cloudflare API token stay in the script's own settings, out of docs – done when: you set several products to 'Need to Publish' and one to 'Archived', press the button once, and within 5 minutes the new products appear, the archived one is gone, and the new products show 'Published' in the sheet.
- [ ] 1.8 Get the site approved and add it to your bios – done when: Shopee has approved the site as a promotion channel (in the affiliate dashboard or confirmed by Shopee support), and the link in each bio opens the site.
🔒 Gate: approval before Phase 2

### Phase 2 – Quick checks
Goal: Answer the two questions that could change the automation plan, before installing anything. · Covers: R4, R7 · Est: ~2 hours
- [ ] 2.1 Check that Hermes may run your local Claude Code CLI on your subscription – done when: `hermes/README.md` records yes or no, with links to current official Anthropic and Hermes docs. If no, stop and choose a fallback together.
- [ ] 2.2 Check what programmatic access Shopee Affiliate (Indonesia) offers for affiliate links and product data, and how to get it – done when: `integrations/README.md` records the findings with official sources.
🔒 Gate: approval before Phase 3

### Phase 3 – Hermes Desktop + Claude Code
Goal: Hermes runs in the desktop app on a free model and can hand a task to Claude Code. · Depends on: 2.1 · Covers: R3, R4 · Est: ~1 day
- [ ] 3.1 Install Hermes Desktop with its Windows installer (it installs Hermes Agent too) – done when: the app opens and `hermes doctor` reports no errors. Undo: uninstall Hermes Desktop and remove its data folder.
- [ ] 3.2 Connect OpenRouter (free account, free model) in the app – done when: a test chat gets a reply from a free model, and the OpenRouter key lives only in Hermes' own config, not in project notes.
- [ ] 3.3 Basic agent task – done when: Hermes uses a tool to create a test file in `hermes/` and reports what it did.
- [ ] 3.4 Claude Code via Hermes – done when: Hermes runs a small Claude Code task through its claude-code skill, and the usage counts against your Claude plan with no paid extra usage.
🔒 Gate: approval before Phase 4

### Phase 4 – n8n on this PC
Goal: n8n runs locally and keeps its data across restarts. · Covers: R5 · Est: ~half a day
- [ ] 4.1 Install Docker Desktop (WSL2 backend) – done when: `docker run hello-world` succeeds. Undo: uninstall Docker Desktop.
- [ ] 4.2 Run n8n with Docker Compose and a named data volume; config files in `n8n/` – done when: n8n opens at `http://localhost:5678`.
- [ ] 4.3 Secure the owner account – done when: the owner account exists with a strong password kept in a password manager.
- [ ] 4.4 Test workflow – done when: a manual test workflow runs, and it is still there after `docker compose down` and `docker compose up -d`.
Undo for the phase: `docker compose down -v` removes n8n and its data.
🔒 Gate: approval before Phase 5

### Phase 5 – HTTPS webhooks
Goal: The internet can reach an n8n webhook over HTTPS, and nothing else is exposed by accident. · Depends on: Phase 4 · Covers: R6 · Est: ~half a day
- [ ] 5.1 Choose the tunnel: with no domain yet, start with ngrok's free plan (check its stable URL and limits); Cloudflare Tunnel becomes an option once you buy a domain – done when: the choice and reasons are in the Decisions log.
- [ ] 5.2 Start the tunnel and set n8n's `WEBHOOK_URL` to the public address – done when: n8n's webhook node shows the public HTTPS URL.
- [ ] 5.3 Webhook test – done when: a request from outside your home network (e.g. a phone on mobile data) triggers the test workflow over HTTPS.
- [ ] 5.4 Lock it down – done when: a webhook protected by a secret header rejects a request without it, and the n8n editor can't be used without logging in.
Undo for the phase: stop the tunnel; nothing stays public.
🔒 Gate: approval before Phase 6

### Phase 6 – Integration research (notes only)
Goal: Know what each service allows before building automation. · Depends on: 2.2 · Covers: R7 · Est: ~1 day
- [ ] 6.1 Social platforms (Threads, X, Instagram, TikTok): API access, posting rules, approval needs and costs – done when: a table in `integrations/README.md`, with official sources.
- [ ] 6.2 Hermes ↔ n8n: how each can call the other – done when: options and a proposed pattern are in `integrations/README.md`.
- [ ] 6.3 n8n ↔ product sheet: how n8n could add or update products in the Google Sheet later – done when: a proposed approach is in `integrations/README.md`.
🔒 Gate: milestone complete → review the context doc and plan the next milestone.

## 4. Risks & open items
- **[Risk]** Free hosting terms may rule out affiliate sites (Vercel's free plan already does) → mitigation: checked in 1.2; fallback: another free host whose terms allow it · blocks 1.6
- **[Risk]** Shopee's terms don't say whether affiliates may show product images on their own website → mitigation: we use Shopee's own image links (no scraping, no copies) and ask Shopee support; fallback: your own photos, or no images · affects 1.5
- **[Risk]** Shopee may not approve the website as a promotion channel → mitigation: no Shopee name or logo on the site; ask in 1.8 · blocks 1.8
- **[Risk]** The service account can read every tab in the workbook, including 'Income & Expenses', because Google shares whole files → accepted for now; keep the key private (outside the repo, only in Cloudflare's build settings); fallback: move 'Product Sheet' to its own spreadsheet · affects 1.4, 1.6
- **[Risk]** Anthropic changed its rules on subscription use in third-party tools several times in 2026 → mitigation: checked in 2.1 and re-checked before later milestones rely on it; fallback: use Claude Code directly, outside Hermes · blocks 3.4
- **[Risk]** Hermes Desktop is a public preview, so expect bugs → mitigation: the CLI and web dashboard use the same install as a fallback · affects Phase 3
- **[Risk]** OpenRouter free models have usage limits and uneven tool-use quality → mitigation: tested in 3.2–3.3; fallback: Gemini free tier · blocks Phase 3
- **[Risk]** Shopee may not offer programmatic affiliate link generation in Indonesia → mitigation: found early in 2.2; manual links in the sheet keep working · affects later milestones
- **[Risk]** Webhooks and scheduled jobs only work while this PC is on (the website doesn't depend on it) → acceptable for this milestone; long-term host is in 'Later'
- **[Assumption]** Hermes, installed on Windows by the desktop installer, can run your Windows Claude Code CLI; fallback: run both in WSL2 · confirm in 3.4

## 5. Next action
Send Shopee Affiliate support the two questions (website approval steps, product images on your own site). 1.7 in progress: set up the 'Publish site' button in the sheet (Apps Script, Cloudflare deploy hook and API token kept in the script's settings).

## 6. Change log
- 2026-10-26 – PRD created from the old PROJECT_CONTEXT.md Phase 1 checklist. Nothing ticked, because no item has been verified yet.
- 2026-10-28 – Reordered so the catalogue website goes online first, fed by a Google Sheet. Hermes phase now starts with Hermes Desktop. Removed the Docker licence item (verified: free for personal use and small businesses). Answered the Shopee status, domain and Hermes desktop questions.
- 2026-10-28 – Added the Claude Code handover (1.1), a check that skips bad sheet rows (1.4) and bulk updates with one button press (1.7). Kept the rebuild approach.
- 2026-10-28 – Approved.
- 2026-10-29 – After the 1.2 rules check: the sheet is private and read through a Google service account (no published sheet); new columns with a Status dropdown replace 'show yes/no'; images use Shopee's own image link pasted by hand; no price and no Shopee name or logo on the site, with a 'View product' button; the update button publishes by Status and removes 'Archived' products; Shopee's website approval moved into 1.8; two new Shopee risks.
- 2026-10-29 – 1.3 matched to the real sheet: tab 'Product Sheet' in your existing workbook, column 'Shopee Affiliate Link', and Price and 'as per (date)' kept for your records (the site ignores them). Accepted the risk that the service account can read the whole workbook.
- 2026-10-29 – 1.4 used Astro 7.4.4, which needs a newer Node.js than the copy bundled with Hermes, so Node.js 24 LTS was installed separately. Recorded that Hermes Agent CLI was already installed. 1.5 now starts with a design brief you approve, and ends with your approval of the look on your phone.
- 2026-10-29 – Design brief agreed (`website/DESIGN_BRIEF.md`): product rows show image, 'VN' + No, name and a 'New' badge, and the whole row opens the product (replaces the 'View product' button). Rows with an empty or duplicate No are also skipped. 1.7 adds a 'Published On' column for the 'New' badge.
- 2026-10-29 – 1.5 is approved from a phone-size screenshot; the check on your own phone moved into 1.6. Design updated: your 'Vn.' logo, Deep Mocha tab colour, smaller header, larger product images, and a thank-you line in the footer instead of the affiliate note.
