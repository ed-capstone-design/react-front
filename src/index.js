import React from 'react';
import './api/setupAxios';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
