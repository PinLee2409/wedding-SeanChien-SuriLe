import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { AdminApp } from './AdminApp'

// index.css paints the body ivory for the invitation. This console is dark, so
// take the body with it — otherwise overscrolling flashes a pale band.
document.documentElement.style.background = '#101a30'
document.body.style.background = '#101a30'
document.body.style.colorScheme = 'dark'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
