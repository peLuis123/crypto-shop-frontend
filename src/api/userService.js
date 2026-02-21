import api from './axios';

export const userService = {
    getProfile: async () => {
        try {
            const response = await api.get('api/auth/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateProfile: async (userData) => {
        try {
            const response = await api.put('api/auth/profile', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    changePassword: async (oldPassword, newPassword) => {
        try {
            const response = await api.post('api/auth/change-password', {
                oldPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    enable2FA: async () => {
        try {
            const response = await api.post('api/auth/2fa/enable');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    verify2FA: async (code) => {
        try {
            const response = await api.post('api/auth/2fa/verify', { code });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    disable2FA: async (code) => {
        try {
            const response = await api.post('api/auth/2fa/disable', { code });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default userService;
