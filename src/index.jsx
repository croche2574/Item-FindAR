import App from './pages/App.jsx'
import './styles.css'

import React from "react"
import { createRoot } from "react-dom/client"

document.addEventListener('DOMContentLoaded', function () {
    const ndRoot = document.getElementById('react-root')
    const root = createRoot(ndRoot)
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    )
})