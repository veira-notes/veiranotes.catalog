# Hermes Agent (Nous Research)

Central AI agent for agent-driven tasks and coordination. Setup steps are in PRD Phase 3.

## Current install (found 29 October 2026)

- Hermes Agent CLI v0.18.0, installed in `C:\Users\jefersono\AppData\Local\hermes` (before this plan). It bundles its own Node.js, Git and Python 3.11.
- Hermes Desktop: an earlier install attempt failed; checked in PRD 3.1.
- Bundled `claude-code` skill: version 2.2.0, at `hermes-agent\skills\autonomous-ai-agents\claude-code\SKILL.md`; it lists Windows as a supported platform.

## May Hermes run my Claude Code CLI on my subscription? (PRD 2.1, checked 2 November 2026)

**Answer: yes, for your own personal use on your own PC, as long as Claude Code keeps its own sign-in and you don't pay for extra usage.**

How it works: Hermes' `claude-code` skill doesn't connect to Anthropic itself. It runs your locally installed, unmodified `claude` CLI (for example `claude -p "…"` for a one-shot task). The CLI uses the login you made yourself with `claude` → browser sign-in (Pro/Max OAuth). Hermes never sees or stores your Claude credentials.

What Anthropic's rules say:

- **Allowed:** Anthropic's Claude Code legal page says its restrictions don't prevent "an end user from signing in to the unmodified Claude Code binary with their own Claude subscription". That is exactly this set-up: you, signed in to the unmodified binary, on your own machine.
- **Not allowed (doesn't apply here, but don't drift into it):** third-party developers may not offer Claude.ai login in their own apps, route requests through Free/Pro/Max/Ultra credentials on behalf of their users, or collect, store or intermediate Claude.ai credentials or session tokens. Products built for other people should use API keys.
- **Usage counts against your plan:** Anthropic's help centre says that when you're signed in with your Claude plan, the Agent SDK, `claude -p` and third-party app usage "still draw from your subscription limits" (updates of 15 June and 7 October 2026). On 15 June 2026 Anthropic paused previously announced changes to Agent SDK usage; they could come back, so re-check before later milestones rely on this.
- **Ordinary, individual use:** the legal page says advertised Pro/Max/Ultra limits "assume ordinary, individual usage of Claude Code and the Agent SDK". Heavy, round-the-clock automation through Hermes would use up your 5-hour and weekly limits quickly.
- **Licence:** Free, Pro, Max and Ultra users are under Anthropic's Consumer Terms of Service.

Rules for this project, so it stays permitted and costs nothing extra (USD 0):

1. Let `claude` keep its own login. Don't copy OAuth tokens (including from `claude setup-token`) into Hermes' config, `.env` files or any other tool.
2. Don't use `--bare` mode or set `ANTHROPIC_API_KEY` for Hermes' Claude Code tasks: those switch to API-key billing (paid).
3. Keep **extra usage / usage credits turned off** in your Claude account settings, so reaching your plan limit stops work instead of charging money.
4. Keep it personal: Hermes runs Claude Code only for you, on this PC. Don't let other people trigger Claude Code tasks through your Hermes (for example from a public webhook or shared chat channel).
5. Never use `--dangerously-skip-permissions` outside a throwaway folder (Hermes' own safety warning).
6. Re-check this section before a later milestone depends on it; Anthropic changed these rules several times in 2026.

Sources:
- [Claude Code docs – Legal and compliance: Authentication and credential use](https://code.claude.com/docs/en/legal-and-compliance)
- [Claude Help Centre – Use the Claude Agent SDK with your Claude plan](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan) (latest dated update 7 October 2026)
- [Claude Help Centre – Use Claude Code with your Pro, Max, or Ultra plan](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-max-or-ultra-plan)
- [Anthropic Consumer Terms of Service](https://www.anthropic.com/legal/consumer-terms)
- [Hermes Agent docs – Claude Code skill](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/autonomous-ai-agents/autonomous-ai-agents-claude-code) and [SKILL.md on GitHub](https://github.com/NousResearch/hermes-agent/blob/main/skills/autonomous-ai-agents/claude-code/SKILL.md)
