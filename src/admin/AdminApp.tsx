import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { galleryPhotos } from '../lib/galleryPhotos'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PHOTO ADMIN — the page behind /admin.html.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every slot on the invitation, with the photograph currently in it, and the
 *  means to swap it for another from the album or for a new file.
 *
 *  Dressed as a dark console rather than as the invitation: photographs are the
 *  content, so the chrome stays out of their way. Uploads are resized here in
 *  the browser into the renditions the site needs, so the dev server never has
 *  to depend on an image library. Writes go through plugins/photo-admin.ts into
 *  the working tree — every change is an ordinary git diff.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const API = '/__photo-admin'
const BASE = import.meta.env.BASE_URL

/** Must match RENDITIONS in plugins/photo-admin.ts. */
const RENDITIONS = [
  { dir: 'src/assets/gallery/full', edge: 2400 },
  { dir: 'src/assets/gallery/display', edge: 1600 },
  { dir: 'src/assets/marquee', edge: 1200 },
] as const
const PORTRAIT_EDGE = 1600

const SHOOTS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'cuoi1_', label: 'Buổi 1' },
  { key: 'cuoi2_', label: 'Buổi 2' },
  { key: 'cuoi3_', label: 'Buổi 3' },
  { key: 'moi_', label: 'Mới tải lên' },
] as const

interface Section {
  key: string
  label: string
  hint: string
  slots: readonly string[] | null
  fixed: boolean
  filenames: string[]
}

interface Framing {
  scale: number
  x: number
  y: number
}

interface Portrait {
  role: string
  label: string
  file: string
  exists: boolean
  stamp: number
  framing: Framing
}

interface State {
  sections: Section[]
  portraits: Portrait[]
  framingLimits: Record<keyof Framing, [number, number]>
  album: string[]
  landscape: string[]
  missing: string[]
}

interface Toast {
  kind: 'ok' | 'error' | 'busy'
  text: string
}

/** What the lightbox is showing: a gallery photo, or a portrait file. */
type Viewing =
  | { kind: 'gallery'; filename: string }
  | { kind: 'portrait'; portrait: Portrait }

const thumbByName = new Map(galleryPhotos.map((p) => [p.filename, p.thumb]))
const displayByName = new Map(galleryPhotos.map((p) => [p.filename, p.display]))
const fullByName = new Map(galleryPhotos.map((p) => [p.filename, p.full]))

const portraitUrl = (portrait: Portrait) =>
  `${BASE}images/web/${portrait.file}?v=${portrait.stamp}`

async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error ?? `Lỗi ${response.status}`)
  return data as T
}

function scaleToJpeg(bitmap: ImageBitmap, edge: number) {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Trình duyệt không dựng được canvas.')
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.86)
}

async function buildRenditions(file: File) {
  const bitmap = await createImageBitmap(file)
  const renditions: Record<string, string> = {}
  for (const { dir, edge } of RENDITIONS) renditions[dir] = scaleToJpeg(bitmap, edge)
  const landscape = bitmap.width > bitmap.height
  bitmap.close()
  return { renditions, landscape }
}

async function buildPortrait(file: File) {
  const bitmap = await createImageBitmap(file)
  const image = scaleToJpeg(bitmap, PORTRAIT_EDGE)
  bitmap.close()
  return image
}

function Frame({
  src,
  alt,
  wide,
  className,
}: {
  src?: string
  alt: string
  wide?: boolean
  className?: string
}) {
  const ratio = wide ? 'aspect-[4/3]' : 'aspect-[3/4]'
  if (!src) {
    return (
      <div
        className={`${ratio} ${className ?? ''} grid place-items-center whitespace-pre-line bg-white/[0.04] px-2 text-center text-[10px] leading-tight text-rose`}
      >
        {`thiếu file\n${alt}`}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`${ratio} ${className ?? ''} w-full object-cover`}
    />
  )
}

/** A pill button — the one interactive shape used everywhere on this page. */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
        active
          ? 'bg-gold text-[#0d1526] shadow-[0_4px_14px_-4px_rgba(200,164,92,0.8)]'
          : 'bg-white/[0.06] text-navy-400 hover:bg-white/[0.12] hover:text-warm-white'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * One portrait, previewed in the same arch the invitation uses, with the zoom
 * and focal point live under it. What you see here is exactly what a guest
 * sees — same crop maths, same frame shape.
 */
function PortraitCard({
  portrait,
  limits,
  dragging,
  onDragState,
  onOpen,
  onUpload,
  onSave,
  onDropFile,
}: {
  portrait: Portrait
  limits: State['framingLimits']
  dragging: boolean
  onDragState: (over: boolean) => void
  onOpen: () => void
  onUpload: () => void
  onSave: (framing: Framing) => Promise<void>
  onDropFile: (file: File) => void
}) {
  const [draft, setDraft] = useState<Framing>(portrait.framing)
  const [saving, setSaving] = useState(false)

  useEffect(() => setDraft(portrait.framing), [portrait.framing])

  const dirty =
    draft.scale !== portrait.framing.scale ||
    draft.x !== portrait.framing.x ||
    draft.y !== portrait.framing.y

  const sliders: Array<{ key: keyof Framing; label: string; step: number; unit: string }> = [
    { key: 'scale', label: 'Phóng to', step: 0.05, unit: '×' },
    { key: 'x', label: 'Ngang', step: 1, unit: '%' },
    { key: 'y', label: 'Dọc', step: 1, unit: '%' },
  ]

  return (
    <article
      onDragOver={(event) => {
        event.preventDefault()
        onDragState(true)
      }}
      onDragLeave={() => onDragState(false)}
      onDrop={(event) => {
        event.preventDefault()
        onDragState(false)
        const file = event.dataTransfer.files?.[0]
        if (file) onDropFile(file)
      }}
      className={`rounded-2xl bg-white/[0.04] p-4 ring-1 transition ${
        dragging ? 'ring-2 ring-gold' : 'ring-white/10'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{portrait.label}</p>
          <p className="mt-0.5 font-mono text-[10px] text-white/45">{portrait.file}</p>
        </div>
        <button
          type="button"
          onClick={onUpload}
          className="shrink-0 rounded-full border border-white/25 px-3 py-1 text-[11px] font-medium transition hover:border-gold hover:text-gold"
        >
          Thay ảnh
        </button>
      </div>

      {/* The arch, exactly as the invitation draws it. */}
      <button
        type="button"
        title="Bấm để xem ảnh gốc"
        onClick={onOpen}
        className="mx-auto mt-4 block w-[min(100%,13rem)] overflow-hidden rounded-t-[999px] rounded-b-[1.8rem] border-[3px] border-warm-white bg-white/[0.06] shadow-[0_18px_38px_-20px_rgba(0,0,0,0.9)] ring-1 ring-gold/35"
      >
        {portrait.exists ? (
          <img
            src={portraitUrl(portrait)}
            alt={portrait.file}
            className="aspect-square w-full object-cover"
            style={{
              objectPosition: `${draft.x}% ${draft.y}%`,
              transform: draft.scale === 1 ? undefined : `scale(${draft.scale})`,
              transformOrigin: `${draft.x}% ${draft.y}%`,
            }}
          />
        ) : (
          <div className="grid aspect-square w-full place-items-center text-[11px] text-rose">
            thiếu file
          </div>
        )}
      </button>

      <div className="mt-4 space-y-2.5">
        {sliders.map(({ key, label, step, unit }) => (
          <label key={key} className="block">
            <span className="flex items-baseline justify-between text-[11px] text-navy-400">
              {label}
              <span className="font-mono text-gold">
                {key === 'scale' ? draft.scale.toFixed(2) : Math.round(draft[key])}
                {unit}
              </span>
            </span>
            <input
              type="range"
              min={limits[key][0]}
              max={limits[key][1]}
              step={step}
              value={draft[key]}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, [key]: Number(event.target.value) }))
              }
              className="mt-1 w-full accent-[#C8A45C]"
            />
          </label>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={async () => {
            setSaving(true)
            await onSave(draft)
            setSaving(false)
          }}
          className="flex-1 rounded-lg bg-gold px-3 py-2 text-[12px] font-semibold text-[#0d1526] transition hover:bg-gold-light disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-navy-400"
        >
          {saving ? 'Đang lưu…' : dirty ? 'Lưu khung hình' : 'Đã lưu'}
        </button>
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => setDraft(portrait.framing)}
          className="rounded-lg border border-white/25 px-3 py-2 text-[12px] transition hover:border-gold hover:text-gold disabled:opacity-30"
        >
          Hoàn tác
        </button>
      </div>
    </article>
  )
}

export function AdminApp() {
  const [state, setState] = useState<State | null>(null)
  const [fatal, setFatal] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [picking, setPicking] = useState<{ section: string; index: number | null } | null>(null)
  const [viewing, setViewing] = useState<Viewing | null>(null)
  const [viewSize, setViewSize] = useState<string>('')
  const [pickerShoot, setPickerShoot] = useState('all')
  const [pickerUnusedOnly, setPickerUnusedOnly] = useState(false)
  const [albumShoot, setAlbumShoot] = useState('all')
  const [dragOver, setDragOver] = useState<string | null>(null)
  const uploadTarget = useRef<
    { kind: 'slot'; section: string; index: number | null } | { kind: 'portrait'; role: string }
  >({ kind: 'slot', section: '', index: null })
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    api<State>('/state')
      .then(setState)
      .catch((e) => setFatal(String(e.message ?? e)))
  }, [])

  useEffect(load, [load])

  useEffect(() => {
    if (!toast || toast.kind === 'busy') return undefined
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!viewing && !picking) return undefined
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (viewing) setViewing(null)
      else setPicking(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewing, picking])

  const usage = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const section of state?.sections ?? []) {
      section.filenames.forEach((name, index) => {
        const label = section.slots?.[index] ?? `Ô ${index + 1}`
        map.set(name, [...(map.get(name) ?? []), `${section.label} → ${label}`])
      })
    }
    return map
  }, [state])

  const isWide = useCallback(
    (filename?: string) => !!filename && !!state?.landscape.includes(filename),
    [state],
  )

  function patchSection(key: string, filenames: string[]) {
    setState((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) => (s.key === key ? { ...s, filenames } : s)),
          }
        : prev,
    )
  }

  async function act(text: string, task: () => Promise<unknown>, done?: string) {
    setToast({ kind: 'busy', text })
    try {
      await task()
      setToast({ kind: 'ok', text: done ?? 'Xong.' })
      return true
    } catch (e) {
      setToast({ kind: 'error', text: String((e as Error).message ?? e) })
      return false
    }
  }

  /** Upload and delete change which files exist, so the page reloads to re-glob. */
  async function reloadingTask(text: string, task: () => Promise<unknown>) {
    setToast({ kind: 'busy', text })
    try {
      await task()
      window.location.reload()
    } catch (e) {
      setToast({ kind: 'error', text: String((e as Error).message ?? e) })
    }
  }

  async function choosePhoto(section: string, index: number | null, filename: string) {
    const target = state?.sections.find((s) => s.key === section)
    if (!target) return
    if (index === null) {
      const ok = await act(
        `Đang thêm ${filename}…`,
        () => api('/slot/add', { section, filename }),
        'Đã thêm ảnh vào mục này.',
      )
      if (ok) patchSection(section, [...target.filenames, filename])
    } else {
      const ok = await act(
        `Đang đặt ${filename}…`,
        () => api('/assign', { section, index, filename }),
        'Đã thay ảnh. Trang thiệp tự cập nhật.',
      )
      if (ok)
        patchSection(
          section,
          target.filenames.map((f, i) => (i === index ? filename : f)),
        )
    }
    setPicking(null)
  }

  async function removeSlot(section: string, index: number) {
    const target = state?.sections.find((s) => s.key === section)
    if (!target) return
    const ok = await act(
      'Đang bỏ khỏi ô…',
      () => api('/slot/remove', { section, index }),
      'Đã bỏ khỏi ô này. Các chỗ khác dùng ảnh đó vẫn giữ nguyên.',
    )
    if (ok) patchSection(section, target.filenames.filter((_, i) => i !== index))
  }

  function pickFile(
    target:
      | { kind: 'slot'; section: string; index: number | null }
      | { kind: 'portrait'; role: string },
  ) {
    uploadTarget.current = target
    fileInput.current?.click()
  }

  async function handleFile(file: File) {
    const target = uploadTarget.current
    if (target.kind === 'portrait') {
      await reloadingTask(`Đang xử lý ${file.name}…`, async () =>
        api('/portrait', { role: target.role, image: await buildPortrait(file) }),
      )
      return
    }
    await reloadingTask(`Đang xử lý ${file.name}…`, async () => {
      const { renditions, landscape } = await buildRenditions(file)
      await api('/upload', {
        originalName: file.name,
        landscape,
        renditions,
        section: target.section || undefined,
        index: target.index ?? undefined,
      })
    })
  }

  async function onFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) await handleFile(file)
  }

  if (fatal) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0d1526] px-6 text-center">
        <div className="max-w-md">
          <p className="label-caps text-[11px] text-rose">Mất kết nối</p>
          <h1 className="mt-3 font-display text-3xl text-warm-white">Dev server chưa chạy</h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-400">{fatal}</p>
          <p className="mt-4 text-sm text-navy-400">
            Trang này chỉ sống khi{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-gold">npm run dev</code> đang
            bật.
          </p>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0d1526]">
        <p className="label-caps animate-pulse text-xs text-gold">Đang tải album…</p>
      </div>
    )
  }

  const filterAlbum = (shoot: string, excludeUsed: boolean) =>
    state.album
      .filter((name) => shoot === 'all' || name.startsWith(shoot))
      .filter((name) => !excludeUsed || !usage.has(name))

  const pickingSection = state.sections.find((s) => s.key === picking?.section)
  const totalSlots = state.sections.reduce((n, s) => n + s.filenames.length, 0)
  const unused = state.album.filter((name) => !usage.has(name)).length
  const navItems = [
    { id: 'chan-dung', label: 'Ảnh đại diện', count: state.portraits.length },
    ...state.sections.map((s) => ({
      id: s.key,
      label: s.label,
      count: s.filenames.length,
    })),
    { id: 'album', label: 'Toàn bộ album', count: state.album.length },
  ]

  return (
    <div className="min-h-screen bg-[#0d1526] bg-[radial-gradient(130%_70%_at_50%_-20%,rgba(200,164,92,0.18),transparent_55%)] text-warm-white">
      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFileInput} />

      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d1526]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-10 gap-y-4 px-8 py-5">
          <div className="mr-auto">
            <p className="label-caps text-[10px] text-gold">Bảng điều khiển ảnh</p>
            <h1 className="mt-1 font-display text-2xl leading-none text-warm-white">
              Thái Bình &amp; Sean Chien
            </h1>
          </div>
          {[
            { value: state.album.length, label: 'ảnh trong album' },
            { value: totalSlots, label: 'vị trí trên thiệp' },
            { value: unused, label: 'chỉ chạy băng chuyền' },
          ].map((stat) => (
            <div key={stat.label} className="text-right">
              <p className="font-mono text-2xl leading-none text-gold">{stat.value}</p>
              <p className="mt-1.5 text-[11px] text-navy-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-10 px-8 pb-32 pt-8">
        {/* ── Side nav ───────────────────────────────────────────────────── */}
        <nav className="sticky top-32 hidden h-fit w-56 shrink-0 lg:block">
          <p className="label-caps mb-3 text-[10px] text-navy-400">Các mục</p>
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="flex items-baseline gap-2 rounded-lg px-3 py-2 text-[13px] text-navy-400 transition hover:bg-white/[0.06] hover:text-warm-white"
                >
                  <span className="flex-1 leading-snug">{item.label}</span>
                  <span className="font-mono text-[10px] text-gold/70">{item.count}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl bg-white/[0.04] p-3 text-[11px] leading-relaxed text-navy-400">
            Sửa ở đây ghi thẳng vào mã nguồn. Xem lại bằng{' '}
            <code className="text-gold-light">git diff</code>, bỏ thì{' '}
            <code className="text-gold-light">git checkout .</code>
          </p>
        </nav>

        <main className="min-w-0 flex-1">
          {state.missing.length > 0 && (
            <p className="mb-8 rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
              Có vị trí trỏ vào ảnh không tồn tại: {state.missing.join(' · ')}
            </p>
          )}

          {/* ── Portraits ────────────────────────────────────────────────── */}
          <section id="chan-dung" className="scroll-mt-32">
            <div className="border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl text-warm-white">Ảnh đại diện</h2>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-navy-400">
                Hai tấm chân dung ở mục "Phi hành đoàn". Chúng nằm ngoài album, trong{' '}
                <code className="text-gold-light">public/images/web/</code>, nên tải ảnh mới sẽ
                ghi đè lên đúng file cũ.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:max-w-2xl">
              {state.portraits.map((portrait) => (
                <PortraitCard
                  key={portrait.role}
                  portrait={portrait}
                  limits={state.framingLimits}
                  dragging={dragOver === portrait.role}
                  onDragState={(over) =>
                    setDragOver(over ? portrait.role : (v) => (v === portrait.role ? null : v))
                  }
                  onOpen={() => setViewing({ kind: 'portrait', portrait })}
                  onUpload={() => pickFile({ kind: 'portrait', role: portrait.role })}
                  onDropFile={(file) => {
                    uploadTarget.current = { kind: 'portrait', role: portrait.role }
                    void handleFile(file)
                  }}
                  onSave={async (framing) => {
                    const ok = await act(
                      'Đang lưu khung hình…',
                      () => api('/portrait/framing', { role: portrait.role, ...framing }),
                      'Đã lưu. Trang thiệp tự cập nhật.',
                    )
                    if (ok)
                      setState((prev) =>
                        prev
                          ? {
                              ...prev,
                              portraits: prev.portraits.map((p) =>
                                p.role === portrait.role ? { ...p, framing } : p,
                              ),
                            }
                          : prev,
                      )
                  }}
                />
              ))}
            </div>
          </section>

          {/* ── Slots ────────────────────────────────────────────────────── */}
          {state.sections.map((section) => (
            <section key={section.key} id={section.key} className="mt-16 scroll-mt-32">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div className="min-w-0">
                  <h2 className="font-display text-2xl text-warm-white">{section.label}</h2>
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-navy-400">
                    {section.hint}
                  </p>
                </div>
                {!section.fixed && (
                  <button
                    type="button"
                    onClick={() => setPicking({ section: section.key, index: null })}
                    className="shrink-0 rounded-full border border-gold/50 px-4 py-1.5 text-[12px] font-medium text-gold transition hover:bg-gold hover:text-[#0d1526]"
                  >
                    + Thêm ảnh
                  </button>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {section.filenames.map((filename, index) => {
                  const label = section.slots?.[index] ?? `Ô ${index + 1}`
                  const spots = usage.get(filename) ?? []
                  const id = `${section.key}-${index}`

                  return (
                    <article
                      key={id}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOver(id)
                      }}
                      onDragLeave={() => setDragOver((v) => (v === id ? null : v))}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragOver(null)
                        const file = e.dataTransfer.files?.[0]
                        if (file) {
                          uploadTarget.current = { kind: 'slot', section: section.key, index }
                          void handleFile(file)
                        }
                      }}
                      className={`group relative overflow-hidden rounded-2xl bg-white/[0.04] ring-1 transition duration-300 ${
                        dragOver === id
                          ? 'ring-2 ring-gold'
                          : 'ring-white/10 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)] hover:ring-gold/60'
                      }`}
                    >
                      <button
                        type="button"
                        title="Bấm để xem ảnh gốc"
                        onClick={() => setViewing({ kind: 'gallery', filename })}
                        className="block w-full"
                      >
                        <Frame
                          src={thumbByName.get(filename)}
                          alt={filename}
                          wide={isWide(filename)}
                          className="transition duration-500 group-hover:scale-[1.03]"
                        />
                      </button>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3.5 pb-3 pt-10">
                        <p className="text-[12px] font-medium leading-tight">{label}</p>
                        <p className="mt-0.5 break-all font-mono text-[9px] leading-tight text-white/55">
                          {filename}
                        </p>
                      </div>

                      {spots.length > 1 && (
                        <span
                          title={spots.join('\n')}
                          className="absolute left-2.5 top-2.5 rounded-full bg-black/75 px-2 py-0.5 font-mono text-[9px] text-gold-light backdrop-blur"
                        >
                          dùng ở {spots.length} chỗ
                        </span>
                      )}

                      <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-1.5 bg-gradient-to-t from-black/95 to-black/70 p-2.5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => setPicking({ section: section.key, index })}
                          className="flex-1 rounded-lg bg-gold px-2 py-1.5 text-[11px] font-semibold text-[#0d1526] transition hover:bg-gold-light"
                        >
                          Đổi ảnh
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            pickFile({ kind: 'slot', section: section.key, index })
                          }
                          className="rounded-lg border border-white/25 px-2.5 py-1.5 text-[11px] font-medium transition hover:border-gold hover:text-gold"
                        >
                          Tải lên
                        </button>
                        {!section.fixed && (
                          <button
                            type="button"
                            title="Bỏ ảnh khỏi riêng ô này — các chỗ khác giữ nguyên"
                            onClick={() => void removeSlot(section.key, index)}
                            className="rounded-lg border border-rose/50 px-2.5 py-1.5 text-[11px] font-medium text-rose transition hover:bg-rose hover:text-[#0d1526]"
                          >
                            Bỏ
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}

          {/* ── The whole album ──────────────────────────────────────────── */}
          <section id="album" className="mt-16 scroll-mt-32">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
              <div className="min-w-0">
                <h2 className="font-display text-2xl text-warm-white">Toàn bộ album</h2>
                <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-navy-400">
                  Tất cả đều chạy trên hai dòng băng chuyền cuối trang album. Bấm vào ảnh để xem
                  cỡ gốc. Ảnh đang giữ vị trí cố định thì không xoá khỏi album được.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SHOOTS.map((shoot) => (
                  <Chip
                    key={shoot.key}
                    active={albumShoot === shoot.key}
                    onClick={() => setAlbumShoot(shoot.key)}
                  >
                    {shoot.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-8">
              {filterAlbum(albumShoot, false).map((filename) => {
                const spots = usage.get(filename) ?? []
                return (
                  <div
                    key={filename}
                    className="group relative overflow-hidden rounded-xl ring-1 ring-white/10 transition hover:ring-gold/60"
                  >
                    <button
                      type="button"
                      title="Bấm để xem ảnh gốc"
                      onClick={() => setViewing({ kind: 'gallery', filename })}
                      className="block w-full"
                    >
                      <Frame
                        src={thumbByName.get(filename)}
                        alt={filename}
                        wide={isWide(filename)}
                      />
                    </button>
                    {spots.length > 0 ? (
                      <span
                        title={spots.join('\n')}
                        className="absolute left-1.5 top-1.5 rounded-full bg-gold px-1.5 text-[9px] font-bold text-[#0d1526]"
                      >
                        {spots.length}
                      </span>
                    ) : (
                      <button
                        type="button"
                        title={`Xoá hẳn ${filename} khỏi album`}
                        onClick={() =>
                          reloadingTask(`Đang xoá ${filename}…`, () =>
                            api('/remove', { filename }),
                          )
                        }
                        className="absolute right-1.5 top-1.5 hidden rounded-full bg-rose px-2 py-0.5 text-[9px] font-bold text-[#0d1526] group-hover:block"
                      >
                        xoá
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>

      {/* ── Picker ───────────────────────────────────────────────────────── */}
      {picking && pickingSection && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setPicking(null)}
        >
          <div
            className="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d1526] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-white/10 px-6 py-4">
              <div className="mr-auto">
                <p className="label-caps text-[10px] text-gold">{pickingSection.label}</p>
                <h3 className="mt-0.5 font-display text-xl text-warm-white">
                  {picking.index === null
                    ? 'Thêm một ảnh nữa'
                    : (pickingSection.slots?.[picking.index] ?? `Ô ${picking.index + 1}`)}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SHOOTS.map((shoot) => (
                  <Chip
                    key={shoot.key}
                    active={pickerShoot === shoot.key}
                    onClick={() => setPickerShoot(shoot.key)}
                  >
                    {shoot.label}
                  </Chip>
                ))}
                <Chip
                  active={pickerUnusedOnly}
                  onClick={() => setPickerUnusedOnly((v) => !v)}
                >
                  Chưa dùng
                </Chip>
              </div>
              <button
                type="button"
                onClick={() => setPicking(null)}
                className="rounded-full border border-white/20 px-3.5 py-1 text-[11px] text-navy-400 transition hover:border-gold hover:text-gold"
              >
                Đóng
              </button>
            </div>

            <div className="grid max-h-[66vh] grid-cols-3 gap-2.5 overflow-y-auto p-6 sm:grid-cols-5 lg:grid-cols-7">
              {filterAlbum(pickerShoot, pickerUnusedOnly).map((filename) => {
                const active =
                  picking.index !== null &&
                  pickingSection.filenames[picking.index] === filename
                const spots = usage.get(filename) ?? []
                return (
                  <button
                    key={filename}
                    type="button"
                    title={spots.length ? `Đang dùng: ${spots.join(' · ')}` : filename}
                    onClick={() => void choosePhoto(picking.section, picking.index, filename)}
                    className={`group relative overflow-hidden rounded-xl ring-2 transition ${
                      active ? 'ring-gold' : 'ring-transparent hover:ring-gold/60'
                    }`}
                  >
                    <Frame
                      src={displayByName.get(filename) ?? thumbByName.get(filename)}
                      alt={filename}
                      wide={isWide(filename)}
                    />
                    {spots.length > 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-black/75 px-1.5 text-[9px] text-gold-light backdrop-blur">
                        {spots.length}
                      </span>
                    )}
                    {active && (
                      <span className="absolute inset-x-0 bottom-0 bg-gold py-0.5 text-center text-[9px] font-bold text-[#0d1526]">
                        đang dùng
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  pickFile({ kind: 'slot', section: picking.section, index: picking.index })
                }
                className="rounded-lg border border-white/25 px-4 py-2 text-[12px] font-medium transition hover:border-gold hover:text-gold"
              >
                Hoặc tải ảnh mới từ máy…
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {viewing && (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-black/95 p-4 backdrop-blur sm:p-8"
          onClick={() => setViewing(null)}
        >
          <div className="flex items-start justify-between gap-6 pb-4 text-left">
            <div className="min-w-0">
              <p className="font-mono text-[12px] text-gold">
                {viewing.kind === 'gallery' ? viewing.filename : viewing.portrait.file}
              </p>
              <p className="mt-1 text-[12px] text-navy-400">
                {viewSize || 'đang tải…'}
                {viewing.kind === 'gallery' &&
                  (usage.get(viewing.filename)?.length ?? 0) > 0 && (
                    <>
                      {' · dùng ở: '}
                      {usage.get(viewing.filename)!.join(' · ')}
                    </>
                  )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewing(null)}
              className="shrink-0 rounded-full border border-white/25 px-4 py-1.5 text-[12px] text-warm-white transition hover:border-gold hover:text-gold"
            >
              Đóng · Esc
            </button>
          </div>
          <div
            className="flex min-h-0 flex-1 items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={
                viewing.kind === 'gallery'
                  ? (fullByName.get(viewing.filename) ??
                    displayByName.get(viewing.filename))
                  : portraitUrl(viewing.portrait)
              }
              alt={viewing.kind === 'gallery' ? viewing.filename : viewing.portrait.file}
              onLoad={(event) => {
                const img = event.currentTarget
                setViewSize(`${img.naturalWidth} × ${img.naturalHeight} px`)
              }}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 z-[80] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium shadow-2xl backdrop-blur ${
            toast.kind === 'error'
              ? 'bg-rose text-[#0d1526]'
              : toast.kind === 'busy'
                ? 'bg-white/15 text-warm-white'
                : 'bg-gold text-[#0d1526]'
          }`}
        >
          {toast.kind === 'busy' && <span className="mr-2 inline-block animate-pulse">●</span>}
          {toast.text}
        </div>
      )}
    </div>
  )
}
