import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyThemeById, getSavedThemeId } from './config/themes'
import { LanguageProvider } from './i18n/LanguageContext'

// Apply the saved colour theme before first paint to avoid a flash.
applyThemeById(getSavedThemeId())

// Kill the browser's own scroll restoration BEFORE first paint — doing this
// later (in an effect) lets Chrome restore the previous position first, and
// the smooth-scroll back to top then gets interrupted mid-page.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
