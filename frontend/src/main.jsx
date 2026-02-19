import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Use env variable or fallback placeholder (Frontend setup instruction)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

import axios from 'axios';

// Global Axios Interceptor for 401 Unauthorized (Force Logout)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page to avoid loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const isConfigured = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('your_google_client_id');

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {!isConfigured ? (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
          <h1>⚠️ Configuration Required</h1>
          <p>The <code>VITE_GOOGLE_CLIENT_ID</code> is missing or set to a placeholder.</p>
          <p>Please open <code>frontend/.env</code> and paste your valid Google Client ID.</p>
          <hr />
          <p>Current Value: {GOOGLE_CLIENT_ID || '(empty)'}</p>
        </div>
      ) : (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </GoogleOAuthProvider>
      )}
    </ErrorBoundary>
  </StrictMode>,
)
