import api from './axios';

export const walletService = {
    getWalletBalance: async () => {
        try {
            const response = await api.get('api/wallet/balance');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getWalletAddress: async () => {
        try {
            const response = await api.get('api/wallet/address');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getWalletTransactions: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`api/transactions?${params}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getTransaction: async (transactionId) => {
        try {
            const response = await api.get(`api/transactions/${transactionId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getWalletInfo: async () => {
        try {
            const response = await api.get('api/wallet');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default walletService;
