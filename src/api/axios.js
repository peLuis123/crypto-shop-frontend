import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // No intentar refresh en estas rutas específicas
        const skipRefreshUrls = [
            'api/auth/login',
            'api/auth/register',
            'api/auth/logout'
        ];

        const shouldSkipRefresh = skipRefreshUrls.some(url => 
            originalRequest.url?.includes(url)
        );

        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            !shouldSkipRefresh
        ) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await api.post('api/auth/refresh-token');
                
                // Guardar nuevo token si viene en la respuesta
                if (refreshResponse.data?.token) {
                    localStorage.setItem('token', refreshResponse.data.token);
                }
                if (refreshResponse.data?.refreshToken) {
                    localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
                }
                
                // Reintentar solicitud original con nuevo token
                originalRequest.headers.Authorization = `Bearer ${refreshResponse.data?.token || refreshResponse.data?.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Si falla el refresh, limpiar datos y cerrar sesión
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
