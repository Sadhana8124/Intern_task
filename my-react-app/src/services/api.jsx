import axios from "axios";

// Create Axios instance
const api = axios.create({
  //baseURL: "http://127.0.0.1:8000", // Base API URL
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000", // Base API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized access
      console.warn("Unauthorized, redirecting to login...");
      // window.location.href = "/login"; // Uncomment if you want auto-redirect
    }
    return Promise.reject(error);
  }
);

export default api;
