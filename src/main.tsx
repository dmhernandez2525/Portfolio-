import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { SpeechProvider } from './context/speech-context'

// Console Easter Eggs for curious developers
console.log("%c👋 Hey, you're curious. I like that.", "font-size: 20px; font-weight: bold;");
console.log("%c💼 If you're checking out my code, maybe we should work together.", "font-size: 14px;");
console.log("%c📧 Reach out: https://linkedin.com/in/danielhernandezny", "font-size: 14px;");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SpeechProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </SpeechProvider>
)
