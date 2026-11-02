// "Publish site" button for the veiranotes catalogue (PRD 1.7).
// Copy of the script in the product workbook: Extensions → Apps Script.
// Secrets live in Project Settings → Script Properties, never in this file:
//   CF_DEPLOY_HOOK_URL  the Pages deploy hook link
//   CF_API_TOKEN        API token with Account → Cloudflare Pages → Read
//   CF_ACCOUNT_ID       Cloudflare account ID
//   CF_PROJECT_NAME     Pages project name (veiranotes)
// Logs: Extensions → Apps Script → Executions → click a run. Secrets are never logged.

const SHEET_NAME = 'Product Sheet';
const NEED_TO_PUBLISH = 'Need to Publish';
const PUBLISHED = 'Published';
const PUBLISHED_ON = 'Published On';
const POLL_MS = 10 * 1000;
// Google stops any run after 6 minutes, so the whole run must finish well before that.
const RUN_BUDGET_MS = 4.5 * 60 * 1000;
// Messages appear as notices in the sheet's corner. Pop-ups (alerts) are not used:
// they wait for an OK click, and an unanswered pop-up made a run hit the 6-minute limit.
const NOTICE_SECONDS = 60;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Catalogue')
    .addItem('Publish site', 'publishSite')
    .addToUi();
}

function publishSite() {
  const runStart = Date.now();
  const book = SpreadsheetApp.getActive();
  const log = (msg) => console.log('[+' + Math.round((Date.now() - runStart) / 1000) + 's] ' + msg);
  const notice = (msg, seconds) => book.toast(msg, 'Catalogue', seconds || NOTICE_SECONDS);

  log('Publish started by ' + (Session.getActiveUser().getEmail() || 'unknown user'));
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(1000)) {
    log('Stopped: another publish is already running.');
    notice('A publish is already running. Please wait for it to finish.');
    return;
  }
  try {
    const props = PropertiesService.getScriptProperties().getProperties();
    const required = ['CF_DEPLOY_HOOK_URL', 'CF_API_TOKEN', 'CF_ACCOUNT_ID', 'CF_PROJECT_NAME'];
    const missing = required.filter((k) => !props[k]);
    log('Script properties: ' + required.map((k) => k + (props[k] ? ' set' : ' MISSING')).join(', '));
    if (missing.length) throw new Error('Missing script properties: ' + missing.join(', '));

    const sheet = book.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Tab "' + SHEET_NAME + '" not found.');
    const col = columnIndex(sheet);
    if (!col.publishedOn) {
      col.publishedOn = sheet.getLastColumn() + 1;
      sheet.getRange(1, col.publishedOn).setValue(PUBLISHED_ON);
      log('Added the "' + PUBLISHED_ON + '" column in column ' + col.publishedOn + '.');
    }

    // Snapshot the rows to publish now, so rows changed during the build are left alone.
    const lastRow = sheet.getLastRow();
    const data = lastRow < 2 ? [] : sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const toPublish = [];
    const incomplete = [];
    data.forEach((r, i) => {
      if (String(r[col.status - 1]).trim() !== NEED_TO_PUBLISH) return;
      // Same rule as the site: rows missing these are skipped there, so don't mark them Published.
      const complete = /^\d+$/.test(String(r[col.no - 1]).trim()) &&
        [col.id, col.name, col.link].every((c) => String(r[c - 1]).trim() !== '');
      (complete ? toPublish : incomplete).push(i + 2);
    });
    log('Rows marked "' + NEED_TO_PUBLISH + '": to publish ' + JSON.stringify(toPublish) +
      ', incomplete ' + JSON.stringify(incomplete));

    const started = new Date();
    notice('Rebuilding the site. This usually takes 1–2 minutes…', -1);
    const hook = UrlFetchApp.fetch(props.CF_DEPLOY_HOOK_URL, { method: 'post', muteHttpExceptions: true });
    const hookBody = hook.getContentText();
    log('Deploy hook answered HTTP ' + hook.getResponseCode() + ': ' + hookBody.slice(0, 300));
    if (hook.getResponseCode() >= 300) {
      throw new Error('Cloudflare did not accept the rebuild (HTTP ' + hook.getResponseCode() + ').');
    }
    let hookDeploymentId = null;
    try {
      hookDeploymentId = (JSON.parse(hookBody).result || {}).id || null;
    } catch (e) {
      // Not JSON: find the build by its start time instead.
    }

    const result = waitForDeployment(props, started, hookDeploymentId, runStart + RUN_BUDGET_MS, log);
    if (result !== 'success') {
      log('Finished without changes: the build ' + result + '.');
      notice('The site was not updated: the build ' + result + '. No statuses were changed. ' +
        'Check the build in Cloudflare, then press Publish site again.');
      return;
    }

    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const marked = [];
    toPublish.forEach((row) => {
      if (String(sheet.getRange(row, col.status).getValue()).trim() !== NEED_TO_PUBLISH) {
        log('Row ' + row + ' changed during the build; left as it is.');
        return;
      }
      sheet.getRange(row, col.status).setValue(PUBLISHED);
      // Plain text yyyy-mm-dd, so the site reads the same date whatever the sheet's locale.
      sheet.getRange(row, col.publishedOn).setNumberFormat('@').setValue(today);
      marked.push(row);
    });
    log('Marked "' + PUBLISHED + '" with ' + today + ': rows ' + JSON.stringify(marked));

    let message = 'The site is updated. ' + marked.length + ' product(s) marked Published.';
    if (incomplete.length) {
      message += ' Not published (missing No, Product ID, Product Name or Shopee Affiliate Link): row ' +
        incomplete.join(', ') + '.';
    }
    notice(message);
    log('Done.');
  } catch (e) {
    log('ERROR: ' + e.message);
    notice('Publish failed: ' + e.message + ' No statuses were changed.');
  } finally {
    lock.releaseLock();
  }
}

// Header name → 1-based column number. Matching ignores case and extra spaces.
function columnIndex(sheet) {
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map((h) => String(h).trim().toLowerCase());
  const find = (name) => header.indexOf(name.toLowerCase()) + 1;
  const col = {
    no: find('No'),
    id: find('Product ID'),
    name: find('Product Name'),
    link: find('Shopee Affiliate Link'),
    status: find('Status'),
    publishedOn: find(PUBLISHED_ON),
  };
  ['no', 'id', 'name', 'link', 'status'].forEach((k) => {
    if (!col[k]) throw new Error('A required column is missing in "' + SHEET_NAME + '": ' + k + '.');
  });
  return col;
}

// Finds the build the hook started and waits for it, until the deadline.
// Returns 'success', 'failed' or 'timed out'.
function waitForDeployment(props, started, knownId, deadline, log) {
  const base = 'https://api.cloudflare.com/client/v4/accounts/' + props.CF_ACCOUNT_ID +
    '/pages/projects/' + encodeURIComponent(props.CF_PROJECT_NAME) + '/deployments';
  const options = { headers: { Authorization: 'Bearer ' + props.CF_API_TOKEN }, muteHttpExceptions: true };
  const callApi = (url) => {
    const res = UrlFetchApp.fetch(url, options);
    const body = JSON.parse(res.getContentText());
    if (!body.success) {
      throw new Error('Cloudflare API (HTTP ' + res.getResponseCode() + '): ' +
        (body.errors || []).map((e) => e.message).join('; '));
    }
    return body.result;
  };

  const since = started.getTime() - 15 * 1000; // small allowance for clock differences
  let id = knownId;
  log(id ? 'Build id from the deploy hook: ' + id : 'No build id in the hook reply; looking for the new build.');
  let lastStage = '';
  while (Date.now() + POLL_MS < deadline) {
    Utilities.sleep(POLL_MS);
    if (!id) {
      const list = callApi(base);
      const recent = list.find((d) => d.environment === 'production' && new Date(d.created_on).getTime() >= since);
      if (!recent) {
        log('New build not listed yet (newest: ' + (list[0] ? list[0].id + ' created ' + list[0].created_on : 'none') + ').');
        continue;
      }
      id = recent.id;
      log('Found the new build: ' + id + ' (created ' + recent.created_on + ').');
    }
    const stage = callApi(base + '/' + id).latest_stage;
    const now = stage.name + ' / ' + stage.status;
    if (now !== lastStage) log('Build ' + id + ': ' + now);
    lastStage = now;
    if (stage.status === 'failure' || stage.status === 'canceled') return 'failed';
    if (stage.name === 'deploy' && stage.status === 'success') return 'success';
  }
  log('Stopped waiting: time budget used (last stage: ' + (lastStage || 'build not found') + ').');
  return 'timed out';
}
