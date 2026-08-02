import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { photoAdmin } from './plugins/photo-admin.js'

export default defineConfig({
  // photoAdmin is `apply: 'serve'`, and admin.html is not a build input, so the
  // photo manager exists only while `npm run dev` is running.
  plugins: [react(), tailwindcss(), photoAdmin()],
  base: '/wedding-SeanChien-SuriLe/',
})
