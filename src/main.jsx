import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="454646212937-v6shm2aq0nn2s2m6krj0d0vaqnka92c4.apps.googleusercontent.com">
    <BrowserRouter>
            <Toaster theme="dark" position="top-center" richColors/>
            <App />
    </BrowserRouter>
     </GoogleOAuthProvider>
  </StrictMode>,
)
