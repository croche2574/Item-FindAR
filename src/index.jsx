import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Neo4jProvider, createDriver } from 'use-neo4j'
import { App } from './pages/App'
import './styles.css'


if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js");
    })
}

document.addEventListener('DOMContentLoaded', function () {
    const ndRoot = document.getElementById('react-root')
    const root = createRoot(ndRoot) 
    const driver = createDriver('bolt', import.meta.env.VITE_DB_DOMAIN, 7687, import.meta.env.VITE_DB_USERNAME, import.meta.env.VITE_DB_PASSWD)
    root.render(
        <StrictMode>
            <Neo4jProvider driver={driver} database={import.meta.env.VITE_DB_NAME}>
                <App />
            </Neo4jProvider>
        </StrictMode>
    )
})