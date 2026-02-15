import axios from "axios";

// Ensure baseURL includes /api - handles cases where env might not have it
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Add Clerk session token to all requests
axiosInstance.interceptors.request.use(async (config) => {
  // Get the Clerk instance from window (set by ClerkProvider)
  const clerk = window.Clerk;

  if (clerk?.session) {
    try {
      const token = await clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to get Clerk token:", error);
    }
  }

  return config;
});

export default axiosInstance;
