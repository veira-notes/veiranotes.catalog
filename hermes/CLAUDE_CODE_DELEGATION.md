# Handing work from Hermes to Claude Code

How to ask Hermes (the `veiranotes` profile, free OpenRouter model) to pass a job to Claude Code, the way it was proven in PRD 3.4 on 12 November 2026.

- **Hermes** is the coordinator. Its free model reads your request, runs Claude Code with the `claude-code` skill, then checks and reports the result.
- **Claude Code** does the real work (reading, writing and changing files, coding) with its own sign-in.

## 1. Before you start

- **Sign-in:** Claude Code uses its own login. Right now that's your work organisation's plan ('ATI Business Group'), your choice until you buy your own Pro/Max plan (PRD open item). Check it any time with `claude auth status`: you want `"authMethod": "claude.ai"`.
- **No API key:** `ANTHROPIC_API_KEY` must not be set anywhere, and Hermes must never use `--bare` mode. Both switch Claude Code to paid API billing.
- **Extra usage:** keep extra usage (usage credits) off, so reaching a limit stops work instead of charging money. On the work plan, the organisation controls this.
- **Personal use only:** only you start Claude Code tasks through Hermes. Never wire it to a public webhook or a shared chat. See "May Hermes run my Claude Code CLI on my subscription?" in `hermes/README.md` for Anthropic's rules.
- **Save your work first:** for any task that changes files, commit or push your current work first, so a bad change is easy to undo with git.

## 2. When to delegate (and when not to)

Good for Claude Code:
- writing or changing code in `website/` or scripts;
- reading several project files and writing a summary, checklist or README section;
- fixing a bug when you can say what's wrong and how to check it.

Keep in Hermes (cheaper, no Claude usage):
- short questions, captions and drafts that need no file changes;
- planning a task before deciding whether Claude Code is needed.

Don't delegate:
- anything that publishes, posts, pushes, deletes data or changes account settings. Claude Code may prepare it, but you do the final step or approve it yourself;
- anything that needs passwords, keys or tokens.

## 3. The message template

Paste this into Hermes Desktop with the **veiranotes** profile selected. Replace the parts in `<…>`.

```text
Use your claude-code skill to hand this job to Claude Code, step by step:

1. In the folder C:\Users\jefersono\Documents\Personal\Affiliate Automation, run Claude Code in print mode with this exact command:
   claude -p "<the task, written as clear instructions: what to read, what to create or change, exact file names, and what 'done' looks like. End with: Only change these files: <list>. Don't change any other file.>" --permission-mode acceptEdits --allowedTools "<tools, see section 4>" --max-turns <number, see section 4>
2. Don't add --dangerously-skip-permissions, --bare or any API key.
3. When Claude Code finishes, check the result yourself (open the changed files and confirm they match the task).
4. Report: the exact command you ran, what Claude Code replied, which files changed, whether the result is correct, and anything that went wrong.
```

Tips for writing the task inside `claude -p "…"`:
- **Be specific:** name the files, the sections, the length and the format.
- **Say what not to touch:** "Only change website/src/lib/site.ts."
- **Say how to check it:** for example "Run npm run build in website/ and report whether it passes."
- **Use single quotes inside the task.** Double quotes would end the `claude -p "…"` text early.
- **Keep one task per run.** Several small runs are easier to check than one big one.

## 4. Choosing the options

| Option | What it does | What to use |
|---|---|---|
| `-p "…"` (print mode) | Runs one task and exits. Hermes' interactive tmux mode doesn't apply on Windows, so always use print mode here. | Always |
| `--permission-mode acceptEdits` | Lets Claude Code create and edit files without asking. Other actions still need permission. | Tasks that write files |
| `--allowedTools "…"` | The tools Claude Code may use without asking. Keep the list as short as the task allows. | Read-only task: `"Read"` · new or changed files: `"Read,Write,Edit"` · build or test check: add `"Bash(npm run build)"` |
| `--max-turns N` | Stops Claude Code after N steps, so a confused run can't go on and on using your plan. | Small task 6 · normal change 15 · bigger change 25 |
| `--output-format json` | Optional. Returns a structured result (turns used, duration) that Hermes can report. | When you want a tidy log |

Never use:
- `--permission-mode bypassPermissions` or `--dangerously-skip-permissions` (they switch off all safety prompts);
- `--bare` (it skips the sign-in and needs a paid API key);
- `--max-budget-usd` (it's for paid API billing, which this project doesn't use).

The options above were checked against `claude --help` for Claude Code 2.1.314 on 12 November 2026. `--max-turns` isn't listed in that help text, but the 3.4 run used it without error.

## 5. Checking the result yourself

Hermes' report is a summary, not proof. After each run:

1. **Changed files:** in the project folder, run `git status`. Only the files named in the task should appear.
2. **The content:** open the changed files, or run `git diff` for files that already existed.
3. **Build:** for website changes, run `npm run build` in `website/` (or have Claude Code do it in the task) and look for `Complete!`.
4. **Claude Code really ran:** Claude Code keeps a record of each session in `C:\Users\jefersono\.claude\projects\C--Users-jefersono-Documents-Personal-Affiliate-Automation\`. A new `.jsonl` file appears at the time of the run. If no new record appears, Hermes did the work itself, not Claude Code.
5. **Keep or undo:** if it's right, commit (and push, if it's for the live site). If it's wrong, undo with `git restore <file>` (changed file) or delete the new file, then try again with a clearer task.

Or ask Claude Code in this project to do these checks for you, as was done for 3.3 and 3.4.

## 6. Worked example (PRD 3.4)

Task given to Hermes:

```text
claude -p "Read website/README.md. Create the file hermes/3.4-claude-code-test.md with: a heading '# Claude Code test (PRD 3.4)', then 3 short bullet points summarising the 'Common cases' part of the README, then a final line 'Written by Claude Code, started by Hermes (veiranotes profile)'. Only create that one file. Don't change any other file." --permission-mode acceptEdits --allowedTools "Read,Write" --max-turns 6
```

Result:
- **Claude Code's work:** it read the README and created the file in one Write, using look-up tools (Read, Glob, Grep) but no other changes. The session record started 16 seconds before the file appeared.
- **Hermes' report:** it re-read the file and reported correctly.
- **The check:** `git status` showed only the new file.

## 7. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Hermes writes the file itself instead of running Claude Code | Its free model skipped the skill. Start the message with "Use your claude-code skill", and check for a new session record (section 5, step 4). |
| Claude Code stops with no change | It hit `--max-turns`, or it needed a tool that isn't in `--allowedTools`. Raise the number or add the tool, then run again. |
| "Not logged in" or an API key error | Run `claude` in a terminal and sign in through the browser. Never paste a token or key into Hermes. |
| A usage or rate limit is reached | The plan's 5-hour or weekly limit is used up. Wait for the reset; don't turn on extra usage. |
| Hermes rate-limited by OpenRouter | The free model allows 50 requests a day without bought credits. Wait until tomorrow, or switch to the backup model `nvidia/nemotron-3.5-super-vl:free` with `/model`. |

## Sources

- [Hermes docs – Claude Code skill](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/autonomous-ai-agents/autonomous-ai-agents-claude-code)
- [Claude Code docs – Legal and compliance (authentication and credential use)](https://code.claude.com/docs/en/legal-and-compliance)
- [Claude Help Centre – Use the Claude Agent SDK with your Claude plan](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)
- `claude --help` on this PC (Claude Code 2.1.314)
