import { StrictMode, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const roteador = import.meta.env.MODE === 'github-pages' ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {createElement(roteador, null, <App />)}
  </StrictMode>,
)
