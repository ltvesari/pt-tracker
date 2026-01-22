import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Fetch user profile on mount if token exists
            api.get("/auth/me")
                .then(res => setUser(res.data))
                .catch(() => {
                    // Invalid token? Logout?
                    // logout();
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (username, password) => {
        try {
            const res = await api.post("/auth/login", { username, password });
            const accessToken = res.data.access_token;
            setToken(accessToken);
            localStorage.setItem("token", accessToken);

            // Fetch User Profile immediately after login
            try {
                // interceptor will pick up the token from localStorage (set above)
                // but usually interceptors run at request time, so it needs to be accessible.
                // Our interceptor reads `localStorage.getItem("token")`, so this is fine.
                const profileRes = await api.get("/auth/me");
                setUser(profileRes.data);
            } catch (err) {
                // Fallback
                setUser({ username, first_name: username });
            }
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await api.post("/auth/register", userData);
            return true;
        } catch (error) {
            console.error("Register failed", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
