import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { SpeechProvider } from './context/speech-context'
import { initWebVitals } from './lib/web-vitals'
import { registerServiceWorker } from './lib/register-sw'

// Console Easter Eggs for curious developers
console.log("%c👋 Hey, you're curious. I like that.", "font-size: 20px; font-weight: bold;");
console.log("%c💼 If you're checking out my code, maybe we should work together.", "font-size: 14px;");
console.log("%c📧 Reach out: https://www.linkedin.com/in/dh25/", "font-size: 14px;");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SpeechProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </SpeechProvider>
)

initWebVitals()
registerServiceWorker()
