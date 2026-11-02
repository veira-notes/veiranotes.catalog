# Automated Shopee Affiliate Marketing Ecosystem – Project Context
_Last updated: 2026-10-29 · Plan: see PRD.md_

## 1. Summary
A personal, AI-assisted affiliate system centred on Shopee. It finds products, manages affiliate links, writes marketing content and publishes it to Threads, X, Instagram, TikTok, Shopee and a catalogue website, with as little manual work as possible. The current milestone puts the catalogue website online first, so selling can start, then sets up the automation tools.

## 2. Goal & success criteria
Goal of the current milestone: the catalogue website is live and selling, and the core automation tools are installed, connected and verified. These are the targets for the end of the milestone:
- The website is live on a free address, linked in your social bios, and every product button opens the right Shopee product through your affiliate link.
- A product added to the Google Sheet appears on the live site without any code change.
- Hermes Desktop completes a basic task on a free model, and runs a Claude Code task through a permitted method.
- n8n runs a test workflow, and the workflow survives a restart.
- A request from the internet reaches an n8n webhook over HTTPS, and protected webhooks reject unauthenticated requests.
- `integrations/README.md` records what each service allows, with official sources.

## 3. Scope
- **In:** Catalogue website live on a free address, with products added by hand in a Google Sheet; Hermes Desktop and Claude Code access; self-hosted n8n on this PC; secure HTTPS webhooks; integration research (notes only).
- **Out:** Scaling (high traffic, speed tuning); anything that needs a paid service.
- **Later:** Custom domain (adds a yearly cost); automated product discovery; content generation workflows; social media auto-posting; n8n adding products to the sheet; long-term n8n host (always-on PC vs. VPS).
- **Constraints:** $0/month (free tiers only) · Claude via Pro/Max subscription only, no API key · Windows x64 PC · website in English · no secrets in docs or the repo.

## 4. Requirements
- **R1** – The catalogue website is live on a free address, in English, works well on phones, and each product links to Shopee through your affiliate link.
- **R2** – You add products by hand in a Google Sheet, and the site updates from it without code changes.
- **R3** – Hermes Agent runs on the Windows PC through Hermes Desktop and completes a basic agent task.
- **R4** – Hermes can use Claude Code through a method Anthropic currently permits, at no extra cost.
- **R5** – n8n Community Edition is self-hosted with persistent data and a secured owner account.
- **R6** – n8n webhooks are reachable from the internet over HTTPS, with access secured.
- **R7** – Before any automation is built, notes record what each service allows: Shopee Affiliate (Indonesia), the social platforms, Hermes ↔ n8n and n8n ↔ product sheet. Notes and research only; no working connections.

## 5. Environment
- **Tools / stack:** Windows (x64) · Claude Code CLI installed · Shopee Affiliate (Indonesia) account approved and active · website, Hermes, n8n and tunnel are planned in PRD.md (Approach) and get recorded here once set up.
- **Hosting:** Website on a free host (planned in PRD.md); Hermes and n8n on this Windows PC; the long-term n8n host is in 'Later'.
- **Local folder:** `C:\Users\jefersono\Documents\Personal\Affiliate Automation`
- **Folder structure:**
```
Affiliate Automation/
├── README.md              # Entry point: folder map and conventions
├── CLAUDE.md              # Read by Claude Code at every session start; points to the two docs below
├── PROJECT_CONTEXT.md     # This document (copy of the claude.ai Project doc)
├── PRD.md                 # Plan, phases and status (copy of the claude.ai Project doc)
├── .gitignore             # Excludes .env/keys, n8n local data, website build output
├── hermes/
│   └── README.md          # Hermes Desktop + Claude Code setup notes and findings
├── n8n/
│   ├── README.md          # n8n install, persistence, tunnel/webhook notes
│   └── workflows/         # Exported workflow JSON (credentials stripped)
├── website/
│   └── README.md          # Catalogue site stack, hosting, product sheet and update flow
├── integrations/
│   └── README.md          # What each service allows: Shopee, socials, Hermes ↔ n8n
├── docs/
│   └── README.md          # Setup logs and research notes (YYYY-MM-DD-topic.md)
└── memory/                # Read-only snapshot of Claude's project memory
    ├── README.md          # Export date, sync direction, how to update
    ├── index.md
    └── areas/
        └── shopee-affiliate-ecosystem.md
```

## 6. Decisions log
| Date | Decision | Reason |
|---|---|---|
| 2026-10-24 | Local project folder at `Documents\Personal\Affiliate Automation`, organised by component (`hermes/`, `n8n/`, `website/`, `integrations/`, `docs/`) | One folder per core component keeps setup notes, configs and code together; secrets excluded via `.gitignore`. |
| 2026-10-26 | Moved to the context + PRD format: this doc holds stable context, PRD.md holds the plan and checklist | Keeps the plan and its status in one place and this doc short. |
| 2026-10-26 | The PRD covers the current milestone only; later stages stay in 'Later' | Validate the base before building automation on it. |
| 2026-10-26 | Hermes runs on OpenRouter free models | $0 budget; using Claude as Hermes' own model needs a Max plan plus paid extra usage. |
| 2026-10-26 | n8n runs on this PC for now; the long-term host is decided later | Enough for testing at $0. |
| 2026-10-28 | Catalogue website goes online first, before the automation tools | You can link it in your bios and start selling while the automation is built. |
| 2026-10-28 | Products are added by hand in a Google Sheet | Easy to fill by hand, and n8n can fill the same sheet later. |
| 2026-10-28 | Website uses a free address now; a custom domain comes later | Keeps the $0 budget until the site earns. |
| 2026-10-28 | Website in English | Your choice. |
| 2026-10-28 | Hermes Desktop is the main Hermes interface and the first step of the Hermes phase | Your priority for working with Hermes. |
| 2026-10-28 | The site rebuilds from the sheet when you press the button (no live sheet reads) | Safest: the live site stays as it is until a new build succeeds, with instant rollback; also the fastest pages for visitors. |
| 2026-10-28 | The website is built in Claude Code on this PC, handed over through CLAUDE.md | Claude Code can create files, run Node.js and push to GitHub; this chat can't. |
| 2026-10-29 | Website hosted on Cloudflare Pages' free plan | Its terms don't ban affiliate or commercial sites (checked in 1.2). |
| 2026-10-29 | Product images use Shopee's own image link, pasted by hand into the sheet | No images to store; Shopee's terms ban automated extraction, and its product pages block bots. |
| 2026-10-29 | No price and no Shopee name, trademark or logo on the site; the button says 'View product' | Prices change often; Shopee's terms (clause 2.7(i)) ban its name and logo on affiliate media. |
| 2026-10-29 | The product sheet stays private and the site reads it through a Google service account | The sheet is for your eyes only; a published sheet is readable by anyone with the link. |
| 2026-10-29 | The product list stays as the 'Product Sheet' tab in your existing workbook, shared whole with the service account | Your choice for now; moving it to its own spreadsheet is the fallback if the key's reach becomes a concern. |
| 2026-10-29 | Website uses Astro 7 on its own Node.js 24 LTS install, separate from Hermes' bundled Node | The latest Astro needs a newer Node; keeping the project's Node separate means a Hermes update can't break the site. |
| 2026-10-29 | The site reads the sheet with a small built-in sign-in (no Google client library) | Fewer packages to maintain; the same code runs locally and on Cloudflare. |
| 2026-10-30 | Code lives in the private GitHub repo `veira-notes/veiranotes.catalog`, committed as veiranotes <veira.notes@gmail.com> | Keeps this personal project separate from your work account. |
| 2026-10-30 | The robot key is an encrypted Cloudflare secret; every push to `main` rebuilds the site | Encrypted secrets do reach the Pages build, so the key never needs to be stored in plain text. |
| 2026-11-02 | The publish script keeps its memory of the last publish in a hidden '_Site Snapshot' tab of the workbook | Lets each publish log what was added, changed and removed without a database or paid service. |
| 2026-10-29 | The Status column drives publishing: the button shows 'Published' and 'Need to Publish' products, removes 'Archived' ones, and marks 'Need to Publish' as 'Published' after a successful build | One button press keeps the site and the sheet in step. |
