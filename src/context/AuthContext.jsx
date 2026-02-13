import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    loading: true,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check user status upon page load
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await api.get('/api/auth/profile');
                if (response.data.user) {
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                // If checking auth/profile fails (perhaps 401 even after retry), assume not logged in.
                // The interceptor might have already tried refreshing.
                if (error.response?.status === 401) {
                    // It's definitely not authenticated
                }
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();

        // Listen for custom logout event dispatched by interceptor
        const handleLogoutEvent = () => {
            logout();
        };

        window.addEventListener('auth:logout', handleLogoutEvent);

        return () => {
            window.removeEventListener('auth:logout', handleLogoutEvent);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            setUser(response.data.user);
            setIsAuthenticated(true);
            return response.data;
        } catch (error) {
            // Re-throw so component can handle UI errors
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/api/auth/register', userData);
            setUser(response.data.user);
            setIsAuthenticated(true);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
