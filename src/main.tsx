import React from 'react'
import ReactDOM from 'react-dom/client'
import FlowExperience from './FlowExperience.tsx'
import './index.css'
import { HeroUIProvider } from '@heroui/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <FlowExperience />
    </HeroUIProvider>
  </React.StrictMode>,
)
