import axios from "axios";

// Create an axios instance with base URL from environment or default to localhost
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to attach token if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
