import App from './pages/App.jsx'
import './styles.css'

import React from "react"
import { createRoot } from "react-dom/client"
import { Neo4jProvider, createDriver } from 'use-neo4j'



document.addEventListener('DOMContentLoaded', function () {
    const ndRoot = document.getElementById('react-root')
    const root = createRoot(ndRoot)
    //const driver = createDriver('bolt', '10.221.85.240', 7687, 'neo4j', 'Rc349603')  
    const driver = createDriver('bolt', '192.168.50.16', 7687, 'neo4j', 'Rc349603')
    root.render(
        <React.StrictMode>
            <Neo4jProvider driver={driver} database="neo4j">
                <App />
            </Neo4jProvider>
        </React.StrictMode>
    )
})