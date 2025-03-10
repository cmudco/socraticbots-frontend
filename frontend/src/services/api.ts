// Modified api.ts to use AuthContext
import axios, { AxiosInstance } from 'axios';
import { useAuth } from '../context/AuthContext';

// Create the base instance
const api: AxiosInstance = axios.create({
  baseURL: 'https://api.socraticbooks.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export a function to configure the API with the auth context
export const setupApi = (auth: ReturnType<typeof useAuth>) => {
  // Request interceptor for adding auth token
  api.interceptors.request.use(
    (config) => {
      if (auth.tokens?.access && config.headers) {
        config.headers.Authorization = `Bearer ${auth.tokens.access}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for handling token expiration
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Use AuthContext's refreshToken function
          const success = await auth.refreshToken();
          
          if (success && auth.tokens?.access) {
            // Update the authorization header with new token
            originalRequest.headers.Authorization = `Bearer ${auth.tokens.access}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Let AuthContext handle the logout process
          auth.logout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return api;
};

// Then in components where you need to make API calls:
/*
function MyComponent() {
  const auth = useAuth();
  const [api, setApi] = useState(null);
  
  useEffect(() => {
    setApi(setupApi(auth));
  }, [auth]);
  
  // Use api for requests
}
*/
