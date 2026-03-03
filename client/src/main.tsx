import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Ініціалізація теми перед рендерингом
(function initTheme() {
  const savedTheme = localStorage.getItem('rack-calculator-theme');
  const root = document.documentElement;
  
  if (savedTheme) {
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.classList.add('dark');
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
