// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SeedService } from './repositories/seedService';
import { useAuthStore } from './store/authStore';  // ← Adicionar

// Run seeding on app startup
const seedService = new SeedService();
seedService.seedAll().catch(console.error);

// Initialize auth state from localStorage BEFORE rendering
useAuthStore.getState().initialize();  // ← Adicionar esta linha

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);