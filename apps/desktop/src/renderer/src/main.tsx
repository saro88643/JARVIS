import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { FloatingWidget } from './components/FloatingWidget.js';
import './index.css';

const params = new URLSearchParams(window.location.search);
const isFloatingMode = params.get('mode') === 'floating';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {isFloatingMode ? <FloatingWidget /> : <App />}
  </React.StrictMode>
);

