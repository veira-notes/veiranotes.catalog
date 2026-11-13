# n8n Community Edition (self-hosted)

The workflow engine that will connect the project's parts. It runs on this Windows PC, free (USD 0), installed with npm on Node.js 24, because Docker Desktop needs administrator rights here (PRD Phase 4). It moves to Docker later (section 5).

## 1. Install (PRD 4.1, 13 November 2026)

- **Version:** n8n 2.47.5, installed with `npm install -g n8n@2.47.5` on Node.js 24.22.2 and npm 11.19.1. No administrator rights needed.
- **Where:** `%LOCALAPPDATA%\Programs\nodejs\node_modules\n8n`, with the `n8n` command on your PATH.
- **npm 11 warning:** npm 11 doesn't run packages' own setup scripts unless you allow them, and it printed a warning listing 15 of them. The two that matter were checked on 13 November 2026 and work without those scripts: `sqlite3` (n8n's database, loaded SQLite 3.44.2) and `isolated-vm` (the Code step's sandbox, ships a ready-made Windows build). Don't allow `@scarf/scarf`: its script only sends install statistics.
- **Update later:** `npm install -g n8n@<version>`, then start n8n once and check it opens. Back up first (section 4).
- **Undo:** `npm uninstall -g n8n`. This keeps the data folder.

## 2. Start and stop (PRD 4.2)

### Start n8n

1. **Open PowerShell:** press the **Windows key**, type `PowerShell`, and click **Windows PowerShell**. You don't need 'Run as administrator'.
2. **Paste this line and press Enter.** It works from any folder, because it uses the full path:
   ```powershell
   & "$HOME\Documents\Personal\Affiliate Automation\n8n\start-n8n.ps1"
   ```
3. **Wait for the ready line.** Wait until the window shows:
   ```text
   Editor is now accessible via:
   http://localhost:5678
   ```
   This usually takes 10–30 seconds. Warnings above it ('deprecated', 'will change') are normal (section 6).
4. **Open n8n:** go to http://localhost:5678 in Chrome and sign in. Chrome fills in the saved login.
5. **Leave the PowerShell window open.** You can minimise it. n8n runs only while that window is open and the PC is on. Webhooks and schedules don't run while it's closed.

### Stop n8n

Click the PowerShell window and press **Ctrl+C**. When the prompt (`PS C:\...>`) comes back, n8n has stopped. Closing the window also stops it. Your workflows are saved in the data folder either way.

### If something goes wrong

| What you see | What to do |
|---|---|
| `n8n : The term 'n8n' is not recognized` | Node.js or n8n isn't on your PATH. Close PowerShell, open a new window and try again. If it still fails, check with `n8n --version`, and reinstall if needed (section 1). |
| `running scripts is disabled on this system` | Run it this way instead (allows this one run only, changes no setting): `powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Personal\Affiliate Automation\n8n\start-n8n.ps1"` |
| `Port 5678 is already in use` or `EADDRINUSE` | n8n is already running, maybe in another window or a Claude Code session. Just open http://localhost:5678, or stop the other copy first. |
| The page doesn't load | Check the PowerShell window still shows the ready line and no error below it. |

### What the start script does

`start-n8n.ps1` sets these settings (no secrets):

| Setting | Value | Why |
|---|---|---|
| `N8N_USER_FOLDER` | your user folder (`C:\Users\jefersono`) | Fixes the data folder at `C:\Users\jefersono\.n8n` |
| `N8N_LISTEN_ADDRESS` | `127.0.0.1` | Only this PC can open n8n. The default (`::`) listens on every network address, so others on the same network could reach it. The Phase 5 tunnel connects from this PC, so it still works. |
| `N8N_PORT` | `5678` | n8n's default port |
| `N8N_DIAGNOSTICS_ENABLED` | `false` | Don't send usage statistics to n8n |

The first start took about a minute to set up the database. Later starts are faster.

## 3. Data folder and encryption key

**Data folder:** `C:\Users\jefersono\.n8n`. It's outside the project folder, so it's never committed (`.gitignore` also excludes `.n8n/` and `n8n/data/`). It holds:

| File | What it is |
|---|---|
| `database.sqlite` (plus `-shm` and `-wal`) | All workflows, credentials (encrypted), executions and the owner account |
| `config` | The **encryption key** (`encryptionKey`), created automatically on the first start |
| `n8nEventLog.log` | n8n's event log |
| `nodes/`, `storage/` | Community nodes and stored files |

**Encryption key:** it lives only in `C:\Users\jefersono\.n8n\config`. Its value is never written in this repo. n8n uses it to encrypt saved credentials. Without it, a copy of the database can't decrypt its credentials. So:
- keep it in your password manager: it's in the Note of the `localhost:5678` entry in Google Password Manager (personal account), next to the owner login;
- never share a screenshot of it. If it's ever exposed, change it before any credentials are saved, or treat every saved credential as exposed;
- never paste it into chat, docs or git;
- when n8n moves (section 5), give the new install the same key.

**Undo for the whole phase:** `npm uninstall -g n8n`, then delete `C:\Users\jefersono\.n8n`. This deletes all workflows and credentials.

## 4. Backup

With n8n stopped, or from a second PowerShell window:

```powershell
$env:N8N_USER_FOLDER = $HOME
n8n export:workflow --backup --output="$HOME\n8n-backup\workflows\"
n8n export:credentials --backup --output="$HOME\n8n-backup\credentials\"
```

Use separate folders: importing credentials fails if workflow files are in the same folder. The credential files stay encrypted with your key. Keep `n8n-backup` out of the project folder. Workflows meant for the repo go in `n8n/workflows/` with credentials removed.

## 5. Move to Docker later

Do this when Docker can run: after ATI IT runs `wsl --install` as administrator so Docker Desktop installs, or on another host.

1. Back up (section 4), and have the encryption key ready from your password manager.
2. Stop the npm n8n (Ctrl+C) and don't start it again, so the two copies don't drift apart.
3. Create a Docker volume and start n8n's official image with the **same key** and the same settings:
   ```powershell
   docker volume create n8n_data
   docker run -d --name n8n -p 127.0.0.1:5678:5678 -e N8N_ENCRYPTION_KEY=<key from password manager> -e N8N_DIAGNOSTICS_ENABLED=false -v n8n_data:/home/node/.n8n n8nio/n8n:<same or newer version>
   ```
   Better: put the key in a git-ignored `.env` file and use `--env-file`, so it isn't saved in your PowerShell history.
4. Open http://localhost:5678 and create the owner account (the import needs one).
5. Copy the backup into the container and import it:
   ```powershell
   docker cp "$HOME\n8n-backup" n8n:/home/node/n8n-backup
   docker exec -u node n8n n8n import:workflow --separate --input=/home/node/n8n-backup/workflows/
   docker exec -u node n8n n8n import:credentials --separate --input=/home/node/n8n-backup/credentials/
   ```
6. Check that the workflows and credentials open and a test workflow runs. Then remove the npm install: `npm uninstall -g n8n`. Keep `C:\Users\jefersono\.n8n` for a while as a fallback.

## 6. Known warnings (13 November 2026)

At start, n8n 2.47.5 lists settings whose defaults will change. None needs action now:
- **Running outside a container is deprecated.** Future versions will need Docker. This is the PRD risk 'npm installs are deprecated from n8n 3.0'; section 5 is the plan.
- **Internal task-runner mode is deprecated.** Revisit when moving to Docker.
- Future default changes to unverified community packages, the Code-step time limit (5 minutes to 1 minute) and the Compression node's limits. Check them before upgrading.

## 7. Phase 4 checklist

- [x] 4.1 n8n installed with npm
- [x] 4.2 Fixed data folder, starts at http://localhost:5678, notes here
- [x] 4.3 Owner account with a strong password in a password manager
- [x] 4.4 Test workflow survives a stop and start

Phase 5 (tunnel and webhooks) adds its notes here.

## Layout

- `start-n8n.ps1`: starts n8n with the settings above
- `workflows/`: exported workflow JSON files (credentials removed)

## Sources

- [n8n docs – Install with npm](https://docs.n8n.io/deploy/host-n8n/install-options/install-with-npm)
- [n8n docs – Deployment environment variables](https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/deployment/) (`N8N_USER_FOLDER`, `N8N_LISTEN_ADDRESS`, `N8N_PORT`)
- [n8n docs – Control telemetry](https://docs.n8n.io/deploy/host-n8n/configure-n8n/security/control-telemetry/) (`N8N_DIAGNOSTICS_ENABLED`)
- [n8n docs – Set a custom encryption key](https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/configuration-examples/set-a-custom-encryption-key/)
- [n8n docs – Backup and restore](https://docs.n8n.io/deploy/host-n8n/keep-n8n-running/backup-and-restore/) (export and import commands)
- [n8n docs – Docker installation](https://docs.n8n.io/deploy/host-n8n/install-options/install-with-docker)
- n8n 2.47.5's own start-up log on this PC (deprecation warnings)
