// api.js
import { useAuth } from './useAuth';

// custom hook to handle API calls with header access token , and refresh token if access token is expired
export function useApi() {

  const { accessToken, refresh } = useAuth();
  
  const apiCall = async (url: string, options: any = {}) => {
    // Add authorization header with access token
    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    };
    
    try {
      const response = await fetch(url, authOptions);
      
      // If unauthorized, try to refresh token
      if (response.status === 401) {
        const refreshed = await refresh();
        if (refreshed) {
          // Retry with new token
          return apiCall(url, options);
        } else {
          // If refresh failed, redirect to login
          console.log('Refresh token failed, return null');
          return null;
        }
      }
      
      return response;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };
  
  return { apiCall };
}