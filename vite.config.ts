import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { photoAdmin } from './plugins/photo-admin.js'
import { siteUrl } from './plugins/site-url.js'

export default defineConfig({
  // photoAdmin is `apply: 'serve'`, and admin.html is not a build input, so the
  // photo manager exists only while `npm run dev` is running.
  // siteUrl fills %SITE_URL% in index.html from this repo's own publicUrl.
  plugins: [react(), tailwindcss(), photoAdmin(), siteUrl()],
  base: '/wedding-SeanChien-SuriLe/',
})
