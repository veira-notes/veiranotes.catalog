// "Publish site" button for the veiranotes catalogue (PRD 1.7).
// Copy of the script in the product workbook: Extensions → Apps Script.
// Secrets live in Project Settings → Script Properties, never in this file:
//   CF_DEPLOY_HOOK_URL  the Pages deploy hook link
//   CF_API_TOKEN        API token with Account → Cloudflare Pages → Read
//   CF_ACCOUNT_ID       Cloudflare account ID
//   CF_PROJECT_NAME     Pages project name (veiranotes)
// Logs: Extensions → Apps Script → Executions → click a run. Secrets are never logged.
// The hidden tab "_Site Snapshot" holds what the site showed after the last successful publish,
// so each publish can log what it adds, changes and removes. Don't edit it by hand.

const SHEET_NAME = 'Product Sheet';
const SNAPSHOT_SHEET = '_Site Snapshot';
// The product fields the site shows: [key, column title].
const SITE_FIELDS = [
  ['id', 'Product ID'],
  ['no', 'No'],
  ['name', 'Product Name'],
  ['image', 'Image URL'],
  ['category', 'Category'],
  ['link', 'Shopee Affiliate Link'],
];
const NEED_TO_PUBLISH = 'Need to Publish';
const PUBLISHED = 'Published';
const PUBLISHED_ON = 'Published On';
// Published On is written as yyyy-MM-dd HH:mm in Jakarta time (UTC+7); the site reads it the same way.
const TIME_ZONE = 'Asia/Jakarta';
const POLL_MS = 10 * 1000;
// Status checks that may fail in a row (for example a brief network error) before the run gives up.
const MAX_FAILED_CHECKS = 5;
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
    const toPublish = []; // { row, label } of complete "Need to Publish" rows
    const incomplete = []; // row numbers of "Need to Publish" rows the site will skip
    const statusCount = {};
    const describe = (r, row) => 'VN' + String(r[col.no - 1]).trim() + ' – ' + String(r[col.name - 1]).trim() + ' (row ' + row + ')';
    data.forEach((r, i) => {
      const status = String(r[col.status - 1]).trim() || '(empty)';
      if (String(r[col.id - 1]).trim() || String(r[col.name - 1]).trim()) statusCount[status] = (statusCount[status] || 0) + 1;
      if (status !== NEED_TO_PUBLISH) return;
      // Same rule as the site: rows missing these are skipped there, so don't mark them Published.
      const complete = /^\d+$/.test(String(r[col.no - 1]).trim()) &&
        [col.id, col.name, col.link].every((c) => String(r[c - 1]).trim() !== '');
      if (complete) toPublish.push({ row: i + 2, label: describe(r, i + 2) });
      else incomplete.push(i + 2);
    });
    log('Products by status: ' + JSON.stringify(statusCount));
    log('To be newly listed (' + toPublish.length + '): ' + (toPublish.map((p) => p.label).join('; ') || 'none'));
    if (incomplete.length) log('Skipped, incomplete (missing No, Product ID, Product Name or link): rows ' + JSON.stringify(incomplete));

    // Compare what the site will show after this build with the last successful publish.
    const liveAfter = siteProducts(data, col);
    const previous = readSnapshot(book);
    let changes = null;
    if (previous) {
      changes = diffProducts(previous.products, liveAfter);
      log('Compared with the last publish (' + previous.savedAt + '): ' + changes.added.length + ' added, ' +
        changes.changed.length + ' changed, ' + changes.removed.length + ' removed, ' + Object.keys(liveAfter).length + ' on the site after this build.');
      changes.added.forEach((p) => log('  Added: ' + productLabel(p)));
      changes.changed.forEach((c) => log('  Changed: ' + productLabel(c.product) + ': ' + c.what.join('; ')));
      changes.removed.forEach((p) => log('  Removed: ' + productLabel(p)));
    } else {
      log('No snapshot of an earlier publish yet. This run saves the first one; changes are listed from the next publish.');
    }

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

    const stamp = Utilities.formatDate(new Date(), TIME_ZONE, 'yyyy-MM-dd HH:mm');
    const marked = [];
    toPublish.forEach((p) => {
      if (String(sheet.getRange(p.row, col.status).getValue()).trim() !== NEED_TO_PUBLISH) {
        log('Changed during the build, left as it is: ' + p.label);
        return;
      }
      sheet.getRange(p.row, col.status).setValue(PUBLISHED);
      // Plain text, so the site reads the same value whatever the sheet's locale.
      sheet.getRange(p.row, col.publishedOn).setNumberFormat('@').setValue(stamp);
      marked.push(p);
    });
    log('Newly listed on the site and marked "' + PUBLISHED + '" at ' + stamp + ' (' + marked.length + '): ' +
      (marked.map((p) => p.label).join('; ') || 'none'));

    saveSnapshot(book, liveAfter, stamp);
    log('Saved the snapshot of ' + Object.keys(liveAfter).length + ' live products for the next comparison.');

    let message = 'The site is updated. ' + marked.length + ' product(s) newly listed' +
      (marked.length ? ': ' + marked.map((p) => p.label.split(' – ')[0]).join(', ') : '') + '.';
    if (changes) {
      message += ' Since the last publish: ' + changes.added.length + ' added, ' + changes.changed.length +
        ' changed, ' + changes.removed.length + ' removed (details in the log).';
    }
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
    image: find('Image URL'), // optional
    category: find('Category'), // optional
    link: find('Shopee Affiliate Link'),
    status: find('Status'),
    publishedOn: find(PUBLISHED_ON),
  };
  ['no', 'id', 'name', 'link', 'status'].forEach((k) => {
    if (!col[k]) throw new Error('A required column is missing in "' + SHEET_NAME + '": ' + k + '.');
  });
  return col;
}

// The products the site will show, keyed by Product ID: "Published" or "Need to Publish" rows
// that have No, Product ID, Product Name and link, skipping repeated numbers or IDs (as the site does).
function siteProducts(data, col) {
  const products = {};
  const seenNos = {};
  data.forEach((r) => {
    const status = String(r[col.status - 1]).trim();
    if (status !== PUBLISHED && status !== NEED_TO_PUBLISH) return;
    const p = {};
    SITE_FIELDS.forEach(([key]) => { p[key] = col[key] ? String(r[col[key] - 1]).trim() : ''; });
    if (!/^\d+$/.test(p.no) || !p.id || !p.name || !p.link) return;
    if (products[p.id] || seenNos[p.no]) return;
    seenNos[p.no] = true;
    products[p.id] = p;
  });
  return products;
}

function productLabel(p) {
  return 'VN' + p.no + ' – ' + p.name;
}

// Lists products added, removed and changed between two snapshots. A changed Product ID
// shows as one removed and one added product, because the ID is how products are matched.
function diffProducts(before, after) {
  const added = [];
  const removed = [];
  const changed = [];
  Object.keys(after).forEach((id) => {
    const a = before[id];
    const b = after[id];
    if (!a) return added.push(b);
    const what = [];
    if (a.no !== b.no) what.push('number VN' + a.no + ' → VN' + b.no);
    if (a.name !== b.name) what.push('name "' + a.name + '" → "' + b.name + '"');
    if (a.image !== b.image) what.push('image changed');
    if (a.category !== b.category) what.push('category "' + a.category + '" → "' + b.category + '"');
    if (a.link !== b.link) what.push('Shopee link changed');
    if (what.length) changed.push({ product: b, what: what });
  });
  Object.keys(before).forEach((id) => { if (!after[id]) removed.push(before[id]); });
  return { added: added, removed: removed, changed: changed };
}

// Reads the hidden snapshot tab. Returns null if there is no earlier publish to compare with.
function readSnapshot(book) {
  const sheet = book.getSheetByName(SNAPSHOT_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, SITE_FIELDS.length + 1).getValues();
  const products = {};
  rows.forEach((r) => {
    const p = {};
    SITE_FIELDS.forEach(([key], i) => { p[key] = String(r[i]).trim(); });
    if (p.id) products[p.id] = p;
  });
  return { products: products, savedAt: String(rows[0][SITE_FIELDS.length]) };
}

// Replaces the hidden snapshot tab with the products now on the site.
function saveSnapshot(book, products, savedAt) {
  let sheet = book.getSheetByName(SNAPSHOT_SHEET);
  if (!sheet) {
    sheet = book.insertSheet(SNAPSHOT_SHEET);
    sheet.hideSheet();
  }
  sheet.clearContents();
  const values = [SITE_FIELDS.map(([, title]) => title).concat('Saved At')];
  Object.keys(products).forEach((id) => {
    values.push(SITE_FIELDS.map(([key]) => products[id][key]).concat(savedAt));
  });
  // Plain text, so numbers and links are stored exactly as typed.
  sheet.getRange(1, 1, values.length, values[0].length).setNumberFormat('@').setValues(values);
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
  let failedChecks = 0;
  while (Date.now() + POLL_MS < deadline) {
    Utilities.sleep(POLL_MS);
    try {
      const outcome = checkOnce();
      failedChecks = 0;
      if (outcome) return outcome;
    } catch (e) {
      // A single failed check (for example Google's "Address unavailable" network error) is
      // retried at the next poll; only several failures in a row stop the run.
      failedChecks++;
      log('Status check ' + failedChecks + ' of ' + MAX_FAILED_CHECKS + ' failed, trying again: ' + e.message);
      if (failedChecks >= MAX_FAILED_CHECKS) throw e;
    }
  }
  log('Stopped waiting: time budget used (last stage: ' + (lastStage || 'build not found') + ').');
  return 'timed out';

  // One status check. Returns 'success' or 'failed' when the build has ended, otherwise null.
  function checkOnce() {
    if (!id) {
      const list = callApi(base);
      const recent = list.find((d) => d.environment === 'production' && new Date(d.created_on).getTime() >= since);
      if (!recent) {
        log('New build not listed yet (newest: ' + (list[0] ? list[0].id + ' created ' + list[0].created_on : 'none') + ').');
        return null;
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
    return null;
  }
}
