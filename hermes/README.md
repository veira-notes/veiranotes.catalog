# Hermes Agent (Nous Research)

Central AI agent for agent-driven tasks and coordination. Setup steps are in PRD Phase 3.

## Current install (updated 3 November 2026, PRD 3.1)

- **Hermes Agent v0.22.6** (stable channel), code in `C:\Users\jefersono\AppData\Local\hermes\hermes-agent`, launcher `hermes.exe` in `...\hermes\bin` (on the user PATH). Data (settings, `.env`, memories, sessions, skills, profiles) stays in `C:\Users\jefersono\AppData\Local\hermes`.
- **Hermes Desktop**, built on this PC: `...\hermes\hermes-agent\apps\desktop\release\win-unpacked\Hermes.exe`. Open it with `hermes desktop --skip-build` (or `hermes desktop` to rebuild after an update).
- The previous v0.18.0 code is kept as `...\hermes\hermes-agent.old-v0.18` until Phase 3 is done; then it can be deleted.
- Profiles: `default` and `fctg-ph` (pre-existing; uses a local model on another machine). Neither was changed in 3.1.
- Bundled `claude-code` skill updated by the installer (lists Windows as supported).

### Why the official Windows installer isn't used (3 November 2026)

- The Hermes Desktop package for Windows is an `.appinstaller`/MSIX file, installed through Windows App Installer. Company policy on this PC (`HKLM\SOFTWARE\Policies\Microsoft\Windows\AppInstaller`) sets `EnableAppInstaller = 0`, which blocks the Windows Package Manager (winget), and `EnableMSAppInstallerProtocol = 0`, which blocks installing packages straight from websites. Opening a downloaded `.appinstaller` file by hand was not tested; the route below avoids the question.
- The Hermes-Setup bootstrap (tried 28 and 29 October) failed at the `venv` stage: it kept the old v0.18.0 code, which isn't linked to the release history, then looked for `pm\lock.json`, which only newer versions have.
- What worked: rename the old code folder, run the official command-line installer (`install.ps1` from hermes-agent.nousresearch.com, `-NonInteractive`), then `hermes desktop --build-only` and `hermes desktop --skip-build`.
- The installer couldn't refresh the optional computer-use driver (needs administrator approval): `hermes computer-use install --upgrade` in an interactive terminal, only if you want Hermes to control the mouse and keyboard.

### Health check after the install

`hermes doctor` on 3 November 2026: no errors (✗). It lists 6 issues to address, none blocking:
- missing API keys for optional tools (`hermes setup`; OpenRouter comes in PRD 3.2);
- two old `custom_providers` entries (local models on other machines) that should move into `config.yaml` `providers:`;
- known npm vulnerabilities in Hermes' build tools, to be fixed upstream ("wait for an upstream lockfile fix, then update").

Sources: [Hermes installation guide](https://hermes-agent.nousresearch.com/docs/getting-started/installation), [Hermes docs home](https://hermes-agent.nousresearch.com/docs/), [App Installer policy (Microsoft Learn)](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-desktopappinstaller).

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
