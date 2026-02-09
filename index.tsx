
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Seniorin aloitussivu käynnistyi onnistuneesti (React 18).");
  } catch (error) {
    console.error("Kriittinen virhe renderöinnissä:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h1 style="color: #e11d48;">Hups! Sovellus ei voinut käynnistyä.</h1>
        <p>Tämä johtuu yleensä teknisestä versiokonfliktista selaimessa.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Päivitä sivu
        </button>
      </div>
    `;
  }
};

// Käynnistys
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
