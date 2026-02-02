// Dynamic API URL configuration
// Uses the same host the browser is accessing from, ensuring mobile/network access works

const getApiUrl = () => {
  // If VITE_API_URL is explicitly set and we're on localhost, use it
  if (import.meta.env.VITE_API_URL && window.location.hostname === 'localhost') {
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, dynamically build the API URL from the current browser host
  // This ensures mobile devices use the correct network IP
  const host = window.location.hostname;
  const apiPort = 5000; // Backend port
  
  return `http://${host}:${apiPort}/api`;
};

export const API_URL = getApiUrl();
