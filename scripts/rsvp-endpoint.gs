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
 *  Columns are fixed, not looked up: A name, B message, C ts, D id, E site.
 *  That is the order the first script wrote in, so replies already in the
 *  sheet stay where they are; a header row is pushed in above them once.
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

/**
 * Fixed column layout, 1-based — NOT looked up by header name.
 *
 * The sheet was born without a header row: the first script simply appended
 * name, message, ts into A, B, C. Reading the layout out of row 1 therefore
 * mistook the oldest reply for a header. So the three original columns keep
 * their places, the two new ones sit to their right, and `ensureHeader`
 * labels them all the first time this script runs.
 */
const COL = { name: 1, message: 2, ts: 3, id: 4, site: 5 }
const HEADER = ['name', 'message', 'ts', 'id', 'site']

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
  ensureHeader(sheet)

  const values = []
  values[COL.name - 1] = name
  values[COL.message - 1] = message
  values[COL.ts - 1] = Number(body.ts) || Date.now()
  values[COL.id - 1] = id
  values[COL.site - 1] = site

  const existing = findRow(sheet, id)
  if (existing > 0) {
    // Only our own columns, so anything the couple added by hand survives.
    sheet.getRange(existing, 1, 1, HEADER.length).setValues([values])
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
  ensureHeader(sheet)
  Logger.log('Columns: %s', JSON.stringify(COL))
  Logger.log(
    'Header row now reads: %s',
    JSON.stringify(sheet.getRange(1, 1, 1, HEADER.length).getValues()[0]),
  )
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

/**
 * Labels the columns, once. A sheet whose first row is already our header is
 * left alone; one that opens straight into replies gets a header row pushed
 * in above them, which keeps every existing reply in the columns it is
 * already sitting in. Idempotent, so every write may call it.
 */
function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER)
    return
  }
  const first = String(sheet.getRange(1, 1).getValue()).trim().toLowerCase()
  if (first === HEADER[0]) return
  sheet.insertRowBefore(1)
  sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER])
}

/** The 1-based row carrying this id, or 0. Row 1 is the header. */
function findRow(sheet, id) {
  const rows = sheet.getLastRow()
  if (rows < 2) return 0
  const ids = sheet.getRange(2, COL.id, rows - 1, 1).getValues()
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
