// Dynamic API URL configuration
// Uses the same host the browser is accessing from, ensuring mobile/network access works

const getApiUrl = () => {
  // In production, use the VITE_API_URL env var (set on Vercel)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, dynamically build the API URL from the current browser host
  // This ensures mobile devices use the correct network IP
  const host = window.location.hostname;
  const apiPort = 5000; // Backend port
  
  return `http://${host}:${apiPort}/api`;
};

export const API_URL = getApiUrl();
