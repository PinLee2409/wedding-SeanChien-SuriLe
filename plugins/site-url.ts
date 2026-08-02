import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE URL — fills `%SITE_URL%` in index.html at build time.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Social scrapers (Facebook, Zalo, Messenger) will not resolve a relative
 *  `og:image`, so the tag needs an absolute address — but the two invitations
 *  deploy to different paths, and a URL written into one repository's HTML
 *  points at the other one's site. Taking it from `site.publicUrl` keeps the
 *  same markup working in both, each resolving to its own deployment.
 *
 *  The value is read out of the config as text rather than imported: importing
 *  it would pull the whole app into vite.config's tsconfig, which resolves
 *  modules the Node way and has no DOM types.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const CONFIG = 'src/config/wedding.config.ts'

export function siteUrl(): Plugin {
  const root = resolve(import.meta.dirname, '..')
  const source = readFileSync(join(root, CONFIG), 'utf8')
  const found = source.match(/publicUrl:\s*'([^']+)'/)
  if (!found) {
    throw new Error(`[site-url] khong doc duoc site.publicUrl trong ${CONFIG}`)
  }
  // Always exactly one trailing slash, so `%SITE_URL%images/…` joins cleanly.
  const url = `${found[1].replace(/\/+$/, '')}/`

  return {
    name: 'site-url',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%SITE_URL%', url),
    },
  }
}

export default siteUrl
