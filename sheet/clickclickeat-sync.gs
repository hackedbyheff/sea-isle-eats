/**
 * Click Click Eat — multi-city Google Sheet sync.
 *
 * One spreadsheet, one TAB per city. Name a tab exactly after a city
 * (e.g. "Sea Isle City", "Philadelphia"); Pull/Push act on the active tab.
 *
 * Setup (once): Extensions → Apps Script, paste this, Save. Then
 * Project Settings → Script properties:
 *   SITE_URL    = https://siceats.com   (the API works from there)
 *   SYNC_SECRET = your IMPORT_SECRET value
 * Reload the sheet. Use the "Click Click Eat" menu.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Click Click Eat')
    .addItem('Pull this tab (by city name)', 'pullActiveTab')
    .addItem('Push this tab to site', 'pushActiveTab')
    .addSeparator()
    .addItem('Pull submissions for this tab', 'pullSubmissionsActive')
    .addToUi();
}

function _config() {
  var p = PropertiesService.getScriptProperties();
  var url = p.getProperty('SITE_URL');
  var secret = p.getProperty('SYNC_SECRET');
  if (!url || !secret) {
    throw new Error('Set SITE_URL and SYNC_SECRET in Project Settings → Script properties.');
  }
  return { url: url.replace(/\/$/, ''), secret: secret };
}

function _fetch(cfg, path, opts) {
  opts = opts || {};
  opts.headers = Object.assign({ 'x-sync-secret': cfg.secret }, opts.headers || {});
  opts.muteHttpExceptions = true;
  return UrlFetchApp.fetch(cfg.url + path, opts);
}

// Map the active tab's name to a city slug via /api/admin/cities.
function _activeCitySlug(cfg) {
  var tab = SpreadsheetApp.getActiveSheet().getName().trim().toLowerCase();
  var res = _fetch(cfg, '/api/admin/cities');
  if (res.getResponseCode() !== 200) throw new Error('Could not load cities: ' + res.getContentText());
  var cities = JSON.parse(res.getContentText()).cities || [];
  var match = cities.filter(function (c) {
    return c.name.trim().toLowerCase() === tab || c.slug === tab;
  })[0];
  if (!match) {
    throw new Error('Rename this tab exactly after a city. Available: ' +
      cities.map(function (c) { return c.name; }).join(', '));
  }
  return match.slug;
}

function _writeRows(sheet, data) {
  var cols = data.columns;
  sheet.clearContents();
  var values = [cols];
  data.rows.forEach(function (r) {
    values.push(cols.map(function (c) { return r[c] != null ? r[c] : ''; }));
  });
  sheet.getRange(1, 1, values.length, cols.length).setValues(values);
  sheet.setFrozenRows(1);
}

function pullActiveTab() {
  var cfg = _config(), slug;
  try { slug = _activeCitySlug(cfg); } catch (e) { SpreadsheetApp.getUi().alert(e.message); return; }
  var res = _fetch(cfg, '/api/admin/export?city=' + encodeURIComponent(slug));
  if (res.getResponseCode() !== 200) { SpreadsheetApp.getUi().alert('Pull failed: ' + res.getContentText()); return; }
  var data = JSON.parse(res.getContentText());
  var sheet = SpreadsheetApp.getActiveSheet();
  _writeRows(sheet, data);
  SpreadsheetApp.getActiveSpreadsheet().toast('Pulled ' + data.rows.length + ' into "' + sheet.getName() + '".', 'Click Click Eat');
}

function pushActiveTab() {
  var cfg = _config();
  var sheet = SpreadsheetApp.getActiveSheet();
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) { SpreadsheetApp.getUi().alert('Nothing to push on this tab.'); return; }
  var headers = values[0], rows = [];
  for (var i = 1; i < values.length; i++) {
    var o = {};
    for (var j = 0; j < headers.length; j++) o[headers[j]] = String(values[i][j]);
    if (o.id) rows.push(o);
  }
  var res = _fetch(cfg, '/api/admin/import', {
    method: 'post', contentType: 'application/json', payload: JSON.stringify({ rows: rows }),
  });
  if (res.getResponseCode() !== 200) { SpreadsheetApp.getUi().alert('Push failed: ' + res.getContentText()); return; }
  var out = JSON.parse(res.getContentText());
  SpreadsheetApp.getActiveSpreadsheet().toast('Saved ' + out.updated + ' listings.' +
    (out.errors && out.errors.length ? ' ' + out.errors.length + ' errors.' : ''), 'Click Click Eat');
}

function pullSubmissionsActive() {
  var cfg = _config(), slug;
  try { slug = _activeCitySlug(cfg); } catch (e) { SpreadsheetApp.getUi().alert(e.message); return; }
  var res = _fetch(cfg, '/api/admin/submissions?city=' + encodeURIComponent(slug));
  if (res.getResponseCode() !== 200) { SpreadsheetApp.getUi().alert('Pull failed: ' + res.getContentText()); return; }
  var data = JSON.parse(res.getContentText());
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = SpreadsheetApp.getActiveSheet().getName() + ' — Submissions';
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  _writeRows(sheet, data);
  ss.toast('Pulled ' + data.rows.length + ' submission(s) into "' + name + '".', 'Click Click Eat');
}
