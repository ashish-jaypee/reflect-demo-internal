import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './css/globals.css'
import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
    <Suspense>
        <App />
    </Suspense>
    ,
)
