import api from './axios';

export const productService = {
    getProducts: async () => {
        try {
            const response = await api.get('api/products');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProductsByCategory: async (category) => {
        try {
            const response = await api.get(`api/products?category=${category}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProduct: async (productId) => {
        try {
            const response = await api.get(`api/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    searchProducts: async (query) => {
        try {
            const response = await api.get(`api/products/search?q=${query}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default productService;
