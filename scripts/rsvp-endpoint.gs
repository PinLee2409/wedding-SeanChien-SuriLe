/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  RSVP ENDPOINT — the Google Apps Script behind `config.rsvp.endpoint`.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Paste this in, save, then deploy as a web app — Execute as: Me, Who has
 *  access: Anyone. Deploying a NEW version of the existing deployment keeps
 *  the URL already in the config; a new deployment mints a new URL, which
 *  then has to be copied back into `rsvp.endpoint` in both invitations.
 *
 *  Two ways to reach the sheet, and the script handles either:
 *    bound      — opened from the spreadsheet (Extensions → Apps Script).
 *                 Leave SPREADSHEET_ID empty.
 *    standalone — its own project on script.google.com. Put the sheet's id
 *                 in SPREADSHEET_ID (the long part of its URL between
 *                 /d/ and /edit).
 *
 *  It exists because the browser cannot be trusted with either of the two
 *  things that matter here:
 *
 *  1. ONE ROW PER GUEST. Every reply carries an `id` minted once per device.
 *     A reply whose id is already in the sheet overwrites that row, so a
 *     guest changing their mind corrects their answer instead of adding a
 *     second one. Without this the sheet grows a row per tap of "change my
 *     answer" and the seat count is guesswork.
 *
 *  2. LIMITS THAT HOLD. The invitation's own quiet period and send cap live
 *     in localStorage, which anyone can clear, and anyone who finds this URL
 *     can post to it directly without opening the invitation at all. The
 *     caps below are the ones that actually bind.
 *
 *  Both sites (`site: 'thaibinh'` and `site: 'suri'`) share this endpoint and
 *  this sheet; every row is tagged with its site.
 *
 *  The sheet is read by header name, and any column it is missing is added on
 *  first use — existing rows and formatting are left alone.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** The "Lời chúc" spreadsheet. Empty ⇒ the one this script is bound to. */
const SPREADSHEET_ID = ''

/** Leave empty to use the first sheet in the spreadsheet. */
const SHEET_NAME = ''

/** Only these sites may write. A reply tagged anything else is dropped. */
const SITES = ['thaibinh', 'suri']

const NAME_MAX = 40
const MESSAGE_MAX = 300

/** Per device: the quiet period between writes, and the lifetime cap. */
const QUIET_SECONDS = 10
const PER_DEVICE_MAX = 20
/** Across everyone: the most writes accepted in one hour. A wedding sees a
 *  few dozen replies in total, so this only ever trips on abuse. */
const HOURLY_MAX = 120

const COLUMNS = ['id', 'name', 'message', 'ts', 'site']

/**
 * The guest list is personal data — names, party sizes, and whatever people
 * wrote in their note. This endpoint is public, so it hands back nothing;
 * the couple read the spreadsheet, and the invitation never asks.
 */
function doGet() {
  return ContentService.createTextOutput('[]').setMimeType(
    ContentService.MimeType.JSON,
  )
}

function doPost(e) {
  const lock = LockService.getScriptLock()
  try {
    // Two guests replying at the same moment must not land on the same row.
    lock.waitLock(20000)
    return handle(e)
  } catch (err) {
    return reply({ ok: false, error: String(err) })
  } finally {
    try {
      lock.releaseLock()
    } catch (err) {
      /* never held */
    }
  }
}

function handle(e) {
  const body = parseBody(e)
  if (!body) return reply({ ok: false, error: 'bad request' })

  const site = String(body.site || '').trim()
  if (SITES.indexOf(site) === -1) return reply({ ok: false, error: 'site' })

  const name = clean(body.name, NAME_MAX)
  const message = clean(body.message, MESSAGE_MAX)
  if (!name || !message) return reply({ ok: false, error: 'empty' })

  // A reply with no id is either an old build or a hand-rolled request; give
  // it one of its own so it cannot overwrite somebody else's row.
  const id = clean(body.id, 64) || 'anon-' + Utilities.getUuid()

  const limited = overLimit(id)
  if (limited) return reply({ ok: false, error: limited })

  const sheet = targetSheet()
  if (!sheet) return reply({ ok: false, error: 'sheet' })

  const col = headerIndex(sheet)
  const row = {}
  row[col.id] = id
  row[col.name] = name
  row[col.message] = message
  row[col.ts] = Number(body.ts) || Date.now()
  row[col.site] = site

  const existing = findRow(sheet, col.id, id)
  const width = sheet.getLastColumn()
  const values = []
  for (let c = 1; c <= width; c += 1) values.push(row[c] === undefined ? '' : row[c])

  if (existing > 0) {
    // Keep any column the couple added by hand: only write the ones we own.
    COLUMNS.forEach(function (key) {
      sheet.getRange(existing, col[key]).setValue(row[col[key]])
    })
    countWrite(id)
    return reply({ ok: true, updated: true })
  }

  sheet.appendRow(values)
  countWrite(id)
  return reply({ ok: true, updated: false })
}

/** The sheet replies are written to, whether this script is bound to the
 *  spreadsheet or stands on its own. Null when neither route finds it. */
function targetSheet() {
  const book = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActive()
  if (!book) return null
  return SHEET_NAME ? book.getSheetByName(SHEET_NAME) : book.getSheets()[0]
}

/**
 * Run this once from the editor (Chạy) before deploying. It says which
 * spreadsheet and sheet the script can see and how many replies are already
 * there, so a wrong SPREADSHEET_ID shows up here rather than on the day.
 */
function checkSetup() {
  const sheet = targetSheet()
  if (!sheet) {
    throw new Error(
      'No spreadsheet. A standalone project needs SPREADSHEET_ID filled in.',
    )
  }
  const rows = Math.max(0, sheet.getLastRow() - 1)
  Logger.log(
    'Spreadsheet: %s · sheet: %s · existing rows: %s',
    sheet.getParent().getName(),
    sheet.getName(),
    rows,
  )
  Logger.log('Columns: %s', JSON.stringify(headerIndex(sheet)))
}

/** The invitation posts JSON as text/plain to dodge a CORS preflight. */
function parseBody(e) {
  try {
    if (e && e.postData && e.postData.contents) {
      return JSON.parse(e.postData.contents)
    }
    return e && e.parameter ? e.parameter : null
  } catch (err) {
    return null
  }
}

function clean(value, max) {
  return String(value === undefined || value === null ? '' : value)
    .trim()
    .slice(0, max)
}

/** Returns a reason string when this write must be refused, else ''. */
function overLimit(id) {
  const cache = CacheService.getScriptCache()

  if (cache.get('quiet-' + id)) return 'too soon'

  const props = PropertiesService.getScriptProperties()
  const seen = Number(props.getProperty('count-' + id) || 0)
  if (seen >= PER_DEVICE_MAX) return 'too many'

  const hour = Math.floor(Date.now() / 3600000)
  const hourly = Number(cache.get('hour-' + hour) || 0)
  if (hourly >= HOURLY_MAX) return 'busy'

  return ''
}

function countWrite(id) {
  const cache = CacheService.getScriptCache()
  cache.put('quiet-' + id, '1', QUIET_SECONDS)

  const props = PropertiesService.getScriptProperties()
  props.setProperty(
    'count-' + id,
    String(Number(props.getProperty('count-' + id) || 0) + 1),
  )

  const hour = Math.floor(Date.now() / 3600000)
  const key = 'hour-' + hour
  cache.put(key, String(Number(cache.get(key) || 0) + 1), 3600)
}

/** Maps our column names to 1-based indices, adding any the sheet lacks. */
function headerIndex(sheet) {
  const width = Math.max(1, sheet.getLastColumn())
  let headers = sheet.getRange(1, 1, 1, width).getValues()[0]
  headers = headers.map(function (h) {
    return String(h).trim().toLowerCase()
  })

  const index = {}
  COLUMNS.forEach(function (key) {
    const at = headers.indexOf(key)
    if (at >= 0) {
      index[key] = at + 1
      return
    }
    headers.push(key)
    index[key] = headers.length
    sheet.getRange(1, headers.length).setValue(key)
  })
  return index
}

/** The 1-based row carrying this id, or 0. */
function findRow(sheet, idColumn, id) {
  const rows = sheet.getLastRow()
  if (rows < 2) return 0
  const ids = sheet.getRange(2, idColumn, rows - 1, 1).getValues()
  for (let i = 0; i < ids.length; i += 1) {
    if (String(ids[i][0]).trim() === id) return i + 2
  }
  return 0
}

function reply(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
