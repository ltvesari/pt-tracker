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

// Add response interceptor to handle unauthorized access (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Force redirect to login
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
