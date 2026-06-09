/**
 * Sea Isle Eats — Google Sheet sync.
 *
 * Paste this into the sheet's Apps Script editor (Extensions → Apps Script),
 * then set two Script Properties (Project Settings → Script properties):
 *   SITE_URL    e.g. https://siceats.com
 *   SYNC_SECRET the same value as IMPORT_SECRET in your site's env vars
 *
 * Reload the sheet. A "Sea Isle Eats" menu appears with:
 *   • Pull latest from site   — fills the sheet with current listings
 *   • Push changes to site    — saves your edits back to the site
 *
 * Edit hours as "11:00-22:00" (24h). Multiple ranges: "11:00-14:00, 16:00-22:00".
 * Leave a day blank for closed. Do NOT edit the id / google_place_id columns.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Sea Isle Eats')
    .addItem('Pull latest from site', 'pullFromSite')
    .addItem('Push changes to site', 'pushToSite')
    .addSeparator()
    .addItem('Pull submissions (suggestions & claims)', 'pullSubmissions')
    .addToUi();
}

function _config() {
  var props = PropertiesService.getScriptProperties();
  var url = props.getProperty('SITE_URL');
  var secret = props.getProperty('SYNC_SECRET');
  var city = props.getProperty('CITY'); // optional: scope this sheet to one city slug
  if (!url || !secret) {
    throw new Error('Set SITE_URL and SYNC_SECRET in Project Settings → Script properties.');
  }
  return { url: url.replace(/\/$/, ''), secret: secret, city: city || '' };
}

function _cityQS(cfg) {
  return cfg.city ? ('?city=' + encodeURIComponent(cfg.city)) : '';
}

function pullFromSite() {
  var cfg = _config();
  var res = UrlFetchApp.fetch(cfg.url + '/api/admin/export' + _cityQS(cfg), {
    headers: { 'x-sync-secret': cfg.secret },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    SpreadsheetApp.getUi().alert('Pull failed: ' + res.getContentText());
    return;
  }
  var data = JSON.parse(res.getContentText());
  var cols = data.columns;
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clearContents();
  var values = [cols];
  data.rows.forEach(function (r) {
    values.push(cols.map(function (c) { return r[c] != null ? r[c] : ''; }));
  });
  sheet.getRange(1, 1, values.length, cols.length).setValues(values);
  sheet.setFrozenRows(1);
  SpreadsheetApp.getActiveSpreadsheet().toast('Pulled ' + data.rows.length + ' listings.', 'Sea Isle Eats');
}

function pushToSite() {
  var cfg = _config();
  var sheet = SpreadsheetApp.getActiveSheet();
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) { SpreadsheetApp.getUi().alert('Nothing to push.'); return; }
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = String(values[i][j]);
    }
    if (obj.id) rows.push(obj);
  }
  var res = UrlFetchApp.fetch(cfg.url + '/api/admin/import', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-sync-secret': cfg.secret },
    payload: JSON.stringify({ rows: rows }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    SpreadsheetApp.getUi().alert('Push failed: ' + res.getContentText());
    return;
  }
  var out = JSON.parse(res.getContentText());
  var msg = 'Saved ' + out.updated + ' listings.' + (out.errors && out.errors.length ? ' ' + out.errors.length + ' errors.' : '');
  SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'Sea Isle Eats');
}

// Pull pending "suggest a change" + "claim listing" submissions into a
// "Submissions" tab (created if it doesn't exist). Read-only inbox.
function pullSubmissions() {
  var cfg = _config();
  var res = UrlFetchApp.fetch(cfg.url + '/api/admin/submissions' + _cityQS(cfg), {
    headers: { 'x-sync-secret': cfg.secret }, muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) {
    SpreadsheetApp.getUi().alert('Pull failed: ' + res.getContentText()); return;
  }
  var data = JSON.parse(res.getContentText());
  var cols = data.columns;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Submissions') || ss.insertSheet('Submissions');
  sheet.clearContents();
  var values = [cols];
  data.rows.forEach(function (r) {
    values.push(cols.map(function (c) { return r[c] != null ? r[c] : ''; }));
  });
  sheet.getRange(1, 1, values.length, cols.length).setValues(values);
  sheet.setFrozenRows(1);
  ss.toast('Pulled ' + data.rows.length + ' submission(s).', 'Sea Isle Eats');
}
