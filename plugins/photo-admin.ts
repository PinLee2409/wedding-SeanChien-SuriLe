import {
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PHOTO ADMIN — a dev-only API behind /admin.html.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Lets the couple swap the photograph in any slot, upload a replacement, or
 *  drop a shot from the album, without anyone editing source. It writes to the
 *  working tree, so every change is a normal git diff you can review and revert.
 *
 *  `apply: 'serve'` keeps it out of the production build entirely — none of
 *  this ships, and admin.html is not in the build inputs either.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ROOT = resolve(import.meta.dirname, '..')
const SLOTS_FILE = join(ROOT, 'src/config/photoSlots.json')
const LANDSCAPE_FILE = join(ROOT, 'src/config/landscapePhotos.json')
const FRAMING_FILE = join(ROOT, 'src/config/portraitFraming.json')

/** Keep the arch frame useful: enough zoom to crop to a face, no more. */
const FRAMING_LIMITS = { scale: [1, 4], x: [0, 100], y: [0, 100] } as const

/** The three renditions every gallery photograph needs, longest edge in px. */
const RENDITIONS = [
  { dir: 'src/assets/gallery/full', edge: 2400 },
  { dir: 'src/assets/gallery/display', edge: 1600 },
  { dir: 'src/assets/marquee', edge: 1200 },
] as const

/**
 * Portraits live outside the gallery, in public/, and are referenced by name
 * from wedding.config.ts. Replacing one overwrites the file in place, so the
 * config never has to change.
 */
const PORTRAITS = [
  { role: 'bride', label: 'Cô dâu', file: 'anh_nu.jpg' },
  { role: 'groom', label: 'Chú rể', file: 'anh_nam.jpg' },
] as const
const PORTRAIT_DIR = 'public/images/web'

/**
 * Slots the admin can edit. `fixed` groups are wired one-to-one to something in
 * the layout — four timeline legs, ten grid cells — so an entry there can be
 * swapped but never dropped, or the layout would be left with a hole.
 */
const SECTIONS = [
  {
    key: 'hero',
    label: 'Trang bìa',
    hint: 'Ảnh nền — ô 1 cho điện thoại, ô 2 cho màn hình rộng.',
    slots: ['Nền điện thoại', 'Nền màn hình rộng'],
    fixed: true,
  },
  {
    key: 'timeline',
    label: 'Hành trình yêu thương',
    hint: 'Bốn chặng bay, theo đúng thứ tự hiển thị.',
    slots: ['Chặng 1 · Chuẩn bị hành trang', 'Chặng 2 · Cùng cất cánh', 'Chặng 3 · Đường bay chung', 'Chặng 4 · Ngày hạ cánh'],
    fixed: true,
  },
  {
    key: 'boardingPass',
    label: 'Thẻ lên máy bay',
    hint: 'Ảnh xoay vòng trên thẻ, đổi mỗi 5 giây. Thêm bớt bao nhiêu tấm cũng được.',
    slots: null,
    fixed: false,
  },
  {
    key: 'downloadScene',
    label: 'Nền khu tải thiệp',
    hint: 'Hai ảnh trang trí hai bên tấm thẻ.',
    slots: ['Cạnh trái', 'Cạnh phải'],
    fixed: true,
  },
  {
    key: 'galleryGrid',
    label: 'Album — Khoảnh khắc yêu thương',
    hint: 'Lưới ảnh xếp theo cột, tự co giãn — thêm bớt bao nhiêu tấm cũng vừa.',
    slots: null,
    fixed: false,
  },
] as const

const SAFE_NAME = /^[a-z0-9][a-z0-9_.-]*\.jpg$/

function readJson(file: string): Record<string, unknown> {
  return JSON.parse(readFileSync(file, 'utf8'))
}

/** Write JSON back keeping the shape stable and the file diff-friendly. */
function writeJson(file: string, value: unknown) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function albumFilenames(): string[] {
  return readdirSync(join(ROOT, 'src/assets/gallery/full'))
    .filter((name) => name.endsWith('.jpg'))
    .sort()
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/** Turn an uploaded file's name into something safe and unique. */
function uniqueName(original: string, taken: Set<string>): string {
  const base =
    original
      .replace(/\.[^.]+$/, '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'anh'
  let name = `moi_${base}.jpg`
  let n = 2
  while (taken.has(name)) name = `moi_${base}-${n++}.jpg`
  return name
}

export function photoAdmin(): Plugin {
  return {
    name: 'photo-admin',
    apply: 'serve',

    configureServer(server: ViteDevServer) {
      server.middlewares.use('/__photo-admin', async (req, res) => {
        const url = (req.url ?? '/').split('?')[0]

        try {
          // ── Current state ────────────────────────────────────────────────
          if (req.method === 'GET' && url === '/state') {
            const slots = readJson(SLOTS_FILE)
            const landscape = readJson(LANDSCAPE_FILE).landscape as string[]
            const album = albumFilenames()
            return send(res, 200, {
              sections: SECTIONS.map((section) => ({
                ...section,
                filenames: (slots[section.key] as string[]) ?? [],
              })),
              // `stamp` busts the browser cache after a portrait is overwritten
              // in place — the filename never changes, so the bytes must say so.
              portraits: PORTRAITS.map((portrait) => {
                const path = join(ROOT, PORTRAIT_DIR, portrait.file)
                const framing = readJson(FRAMING_FILE)[portrait.role] as
                  | Record<string, number>
                  | undefined
                return {
                  ...portrait,
                  exists: existsSync(path),
                  stamp: existsSync(path) ? statSync(path).mtimeMs : 0,
                  framing: { scale: 1, x: 50, y: 8, ...framing },
                }
              }),
              framingLimits: FRAMING_LIMITS,
              album,
              landscape,
              missing: Object.entries(slots)
                .filter(([key]) => !key.startsWith('$'))
                .flatMap(([key, names]) =>
                  (names as string[])
                    .filter((name) => !album.includes(name))
                    .map((name) => `${key}: ${name}`),
                ),
            })
          }

          // ── Point a slot at a photograph already in the album ────────────
          if (req.method === 'POST' && url === '/assign') {
            const { section, index, filename } = (await readBody(req)) as {
              section: string
              index: number
              filename: string
            }
            if (!SAFE_NAME.test(filename)) return send(res, 400, { error: 'Tên file không hợp lệ.' })
            if (!albumFilenames().includes(filename))
              return send(res, 404, { error: `Không có ảnh ${filename} trong album.` })

            const slots = readJson(SLOTS_FILE)
            const list = slots[section]
            if (!Array.isArray(list) || index < 0 || index >= list.length)
              return send(res, 400, { error: 'Vị trí không tồn tại.' })

            list[index] = filename
            writeJson(SLOTS_FILE, slots)
            return send(res, 200, { ok: true, section, index, filename })
          }

          // ── Add a new photograph, optionally straight into a slot ────────
          if (req.method === 'POST' && url === '/upload') {
            const body = (await readBody(req)) as {
              originalName?: string
              landscape?: boolean
              renditions?: Record<string, string>
              section?: string
              index?: number
            }
            const renditions = body.renditions ?? {}
            const missing = RENDITIONS.filter((r) => !renditions[r.dir])
            if (missing.length)
              return send(res, 400, { error: 'Thiếu bản ảnh đã thu nhỏ.' })

            const taken = new Set(albumFilenames())
            const filename = uniqueName(body.originalName ?? 'anh.jpg', taken)

            for (const rendition of RENDITIONS) {
              const base64 = renditions[rendition.dir].replace(/^data:image\/\w+;base64,/, '')
              writeFileSync(join(ROOT, rendition.dir, filename), Buffer.from(base64, 'base64'))
            }

            if (body.landscape) {
              const config = readJson(LANDSCAPE_FILE)
              const list = config.landscape as string[]
              if (!list.includes(filename)) {
                list.push(filename)
                list.sort()
                writeJson(LANDSCAPE_FILE, config)
              }
            }

            if (body.section && typeof body.index === 'number') {
              const slots = readJson(SLOTS_FILE)
              const list = slots[body.section]
              if (Array.isArray(list) && body.index >= 0 && body.index < list.length) {
                list[body.index] = filename
                writeJson(SLOTS_FILE, slots)
              }
            }

            return send(res, 200, { ok: true, filename })
          }

          // ── Replace a portrait, in place, keeping its filename ───────────
          if (req.method === 'POST' && url === '/portrait') {
            const { role, image } = (await readBody(req)) as {
              role: string
              image: string
            }
            const portrait = PORTRAITS.find((p) => p.role === role)
            if (!portrait) return send(res, 400, { error: 'Không có vai trò này.' })
            if (typeof image !== 'string' || !image)
              return send(res, 400, { error: 'Thiếu dữ liệu ảnh.' })

            const base64 = image.replace(/^data:image\/\w+;base64,/, '')
            writeFileSync(
              join(ROOT, PORTRAIT_DIR, portrait.file),
              Buffer.from(base64, 'base64'),
            )
            return send(res, 200, { ok: true, file: portrait.file, stamp: Date.now() })
          }

          // ── Reframe a portrait inside its arch ───────────────────────────
          if (req.method === 'POST' && url === '/portrait/framing') {
            const { role, scale, x, y } = (await readBody(req)) as {
              role: string
              scale: number
              x: number
              y: number
            }
            if (!PORTRAITS.some((p) => p.role === role))
              return send(res, 400, { error: 'Không có vai trò này.' })

            const clamp = (value: unknown, [min, max]: readonly [number, number]) => {
              const n = Number(value)
              if (!Number.isFinite(n)) return null
              return Math.min(max, Math.max(min, Math.round(n * 100) / 100))
            }
            const next = {
              scale: clamp(scale, FRAMING_LIMITS.scale),
              x: clamp(x, FRAMING_LIMITS.x),
              y: clamp(y, FRAMING_LIMITS.y),
            }
            if (next.scale === null || next.x === null || next.y === null)
              return send(res, 400, { error: 'Thông số khung hình không hợp lệ.' })

            const config = readJson(FRAMING_FILE)
            config[role] = next
            writeJson(FRAMING_FILE, config)
            return send(res, 200, { ok: true, role, framing: next })
          }

          // ── Take one entry out of a slot list, leaving the rest alone ────
          if (req.method === 'POST' && url === '/slot/remove') {
            const { section, index } = (await readBody(req)) as {
              section: string
              index: number
            }
            const meta = SECTIONS.find((s) => s.key === section)
            if (!meta) return send(res, 400, { error: 'Không có mục này.' })
            if (meta.fixed)
              return send(res, 409, {
                error: `"${meta.label}" có số ô cố định — hãy thay ảnh khác vào ô đó thay vì bỏ trống.`,
              })

            const slots = readJson(SLOTS_FILE)
            const list = slots[section]
            if (!Array.isArray(list) || index < 0 || index >= list.length)
              return send(res, 400, { error: 'Vị trí không tồn tại.' })
            if (list.length <= 1)
              return send(res, 409, { error: 'Phải chừa lại ít nhất một ảnh.' })

            const [removed] = list.splice(index, 1)
            writeJson(SLOTS_FILE, slots)
            // The photograph itself is untouched: it stays in the album and in
            // every other slot that uses it.
            return send(res, 200, { ok: true, removed })
          }

          // ── Add one more entry to a slot list ────────────────────────────
          if (req.method === 'POST' && url === '/slot/add') {
            const { section, filename } = (await readBody(req)) as {
              section: string
              filename: string
            }
            const meta = SECTIONS.find((s) => s.key === section)
            if (!meta) return send(res, 400, { error: 'Không có mục này.' })
            if (meta.fixed)
              return send(res, 409, { error: `"${meta.label}" có số ô cố định.` })
            if (!SAFE_NAME.test(filename)) return send(res, 400, { error: 'Tên file không hợp lệ.' })
            if (!albumFilenames().includes(filename))
              return send(res, 404, { error: `Không có ảnh ${filename} trong album.` })

            const slots = readJson(SLOTS_FILE)
            const list = slots[section]
            if (!Array.isArray(list)) return send(res, 400, { error: 'Mục không hợp lệ.' })
            list.push(filename)
            writeJson(SLOTS_FILE, slots)
            return send(res, 200, { ok: true, filename })
          }

          // ── Drop a photograph from the album ─────────────────────────────
          if (req.method === 'POST' && url === '/remove') {
            const { filename } = (await readBody(req)) as { filename: string }
            if (!SAFE_NAME.test(filename)) return send(res, 400, { error: 'Tên file không hợp lệ.' })

            const slots = readJson(SLOTS_FILE)
            const usedIn = Object.entries(slots)
              .filter(([key]) => !key.startsWith('$'))
              .filter(([, names]) => Array.isArray(names) && (names as string[]).includes(filename))
              .map(([key]) => key)
            if (usedIn.length)
              return send(res, 409, {
                error: `Ảnh này đang giữ vị trí ở: ${usedIn.join(', ')}. Thay ảnh khác vào các chỗ đó trước đã.`,
              })

            for (const rendition of RENDITIONS) {
              const path = join(ROOT, rendition.dir, filename)
              if (existsSync(path)) unlinkSync(path)
            }

            const config = readJson(LANDSCAPE_FILE)
            const list = config.landscape as string[]
            const at = list.indexOf(filename)
            if (at !== -1) {
              list.splice(at, 1)
              writeJson(LANDSCAPE_FILE, config)
            }

            return send(res, 200, { ok: true, filename })
          }

          return send(res, 404, { error: 'Không có endpoint này.' })
        } catch (error) {
          server.config.logger.error(`[photo-admin] ${String(error)}`)
          return send(res, 500, { error: String(error) })
        }
      })

      server.config.logger.info(
        '\n  \x1b[35m➜\x1b[0m  \x1b[1mQuản lý ảnh\x1b[0m: thêm \x1b[36madmin.html\x1b[0m vào sau địa chỉ ở trên\n',
      )
    },
  }
}

export default photoAdmin
