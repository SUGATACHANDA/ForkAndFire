import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.jsx'
import './index.css'
import './print.css';
import { AuthProvider } from './context/AuthContext.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

    <AuthProvider>
      <Router>
        <ScrollToTop />
        <App />
      </Router>
    </AuthProvider>
  </React.StrictMode>
)