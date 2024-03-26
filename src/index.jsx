import { App } from './pages/App'
import './styles.css'

import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Neo4jProvider, createDriver } from 'use-neo4j'
/**
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js");
    })
}
 */

document.addEventListener('DOMContentLoaded', function () {
    const ndRoot = document.getElementById('react-root')
    const root = createRoot(ndRoot)
    //const driver = createDriver('bolt', '10.221.85.240', 7687, 'neo4j', 'Rc349603')  
    const driver = createDriver('bolt', '192.168.50.16', 7687, 'neo4j', 'Rc349603')
    root.render(
        <StrictMode>
            <Neo4jProvider driver={driver} database="labset">
                <App />
            </Neo4jProvider>
        </StrictMode>
    )
})