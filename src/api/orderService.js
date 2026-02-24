import api from './axios';

export const orderService = {
    getUserOrders: async (params = {}) => {
        try {
            const response = await api.get('api/orders', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getOrder: async (orderId) => {
        try {
            const response = await api.get(`api/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createOrder: async (orderData) => {
        try {
            const response = await api.post('api/orders', orderData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    cancelOrder: async (orderId) => {
        try {
            const response = await api.post(`api/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getOrderStatus: async (orderId) => {
        try {
            const response = await api.get(`api/orders/${orderId}/status`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    payOrder: async (orderId) => {
        try {
            const response = await api.post(`api/orders/${orderId}/pay`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default orderService;
