import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

// Initialize dark mode class on document root before React mounts so styles are consistent across SSR/initial paint
try {
  const savedDark = localStorage.getItem('darkMode');
  if (savedDark === 'true') {
    document.documentElement.classList.add('dark');
  } else if (savedDark === 'false') {
    document.documentElement.classList.remove('dark');
  }
} catch (e) {
  // ignore (localStorage may not be available in some environments)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
