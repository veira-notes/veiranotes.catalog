# Affiliate Automation

Automated Shopee affiliate marketing ecosystem: Hermes Agent + self-hosted n8n + affiliate catalog website.

**Start here:** [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — objective, architecture, Phase 1 checklist, open questions and decisions log. Keep it current.

**Current phase:** Phase 1 — Foundation & Environment Setup

## Folder map

| Folder | What goes here | Phase 1 item |
|---|---|---|
| `hermes/` | Hermes Agent setup notes, config references, Claude Code auth findings | Hermes installed + Claude Code auth verified |
| `n8n/` | n8n install (e.g. Docker Compose), exported workflows, tunnel/webhook notes | n8n self-hosted + external access verified |
| `website/` | Affiliate catalog site source and notes | Website foundation scaffolded |
| `integrations/` | Requirements and constraints for Shopee affiliate, social platforms, Hermes ↔ n8n | Integration readiness documented |
| `docs/` | Cross-cutting notes: setup logs, research, references | — |
| `memory/` | Read-only snapshot of Claude's project memory (one-way export) | — |

## Conventions

- Secrets (API keys, tokens, `.env`) never get committed or pasted into notes — see `.gitignore`.
- Record every significant choice in the Decisions Log in `PROJECT_CONTEXT.md`.
- Each component folder's README has a short checklist; tick items only after they're verified working.
