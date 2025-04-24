
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure we're attaching to the root element correctly
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found!");
} else {
  createRoot(rootElement).render(<App />);
}
