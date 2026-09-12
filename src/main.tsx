import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/app.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root missing — index.html changed?')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* retire the boot splash once React has painted */
requestAnimationFrame(() => {
  const boot = document.getElementById('boot')
  if (!boot) return
  boot.dataset.done = 'true'
  window.setTimeout(() => boot.remove(), 500)
})
