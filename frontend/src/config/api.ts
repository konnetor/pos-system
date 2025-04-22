// API Configuration
// In production on Vercel, use relative URLs for API calls (API routes will be handled by Vercel)
export const BACKEND_URL = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_BACKEND_URL || 'https://app.autospalk.com/api');

// export const BACKEND_URL = 'http://172.245.95.218:8000';

// export const BACKEND_URL = 'http://localhost:8000';

// Helper function to construct API URLs
export const getApiUrl = (endpoint: string): string => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${BACKEND_URL}/${cleanEndpoint}`;
};