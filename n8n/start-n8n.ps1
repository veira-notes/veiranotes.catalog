# Starts n8n for the veiranotes project. No secrets in this file.
# Run in PowerShell:  & "$HOME\Documents\Personal\Affiliate Automation\n8n\start-n8n.ps1"
# Stop with Ctrl+C in the same window.

# Data folder: n8n creates and uses "$HOME\.n8n" (database, encryption key, settings).
$env:N8N_USER_FOLDER = $HOME

# Only this PC can open n8n (the default listens on every network address).
$env:N8N_LISTEN_ADDRESS = '127.0.0.1'
$env:N8N_PORT = '5678'

# Don't send usage statistics to n8n.
$env:N8N_DIAGNOSTICS_ENABLED = 'false'

n8n start
