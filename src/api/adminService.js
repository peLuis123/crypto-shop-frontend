import api from './axios';

const adminService = {
  // Dashboard
  getStats: async () => {
    const response = await api.get('api/admin/stats');
    return response.data;
  },

  // Sales
  getSales: async (status = null, page = 1, limit = 10) => {
    let url = `api/admin/sales?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.patch(`api/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  refundOrder: async (orderId) => {
    const response = await api.post(`api/admin/orders/${orderId}/refund`);
    return response.data;
  },

  // Customers
  getCustomers: async (search = '', page = 1, limit = 10) => {
    let url = `api/admin/customers?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    const response = await api.get(url);
    return response.data;
  },

  blockCustomer: async (customerId, isActive) => {
    const response = await api.patch(`api/admin/customers/${customerId}/block`, { isActive });
    return response.data;
  },

  exportCustomers: async () => {
    const response = await api.get('api/admin/customers/export');
    return response.data;
  },

  // Products (Admin)
  getAdminProducts: async (search = '', category = '', page = 1, limit = 10) => {
    let url = `api/admin/products?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (category) url += `&category=${category}`;
    const response = await api.get(url);
    return response.data;
  },

  createAdminProduct: async (productData) => {
    const response = await api.post('api/admin/products', productData);
    return response.data;
  },

  updateAdminProduct: async (productId, productData) => {
    const response = await api.patch(`api/admin/products/${productId}`, productData);
    return response.data;
  },

  deleteAdminProduct: async (productId) => {
    const response = await api.delete(`api/admin/products/${productId}`);
    return response.data;
  },

  // Legacy (kept for compatibility)
  getUsers: async (role = null, page = 1, limit = 10) => {
    return adminService.getCustomers('', page, limit);
  },

  createProduct: async (productData) => {
    return adminService.createAdminProduct(productData);
  },

  updateProduct: async (productId, productData) => {
    return adminService.updateAdminProduct(productId, productData);
  },

  deleteProduct: async (productId) => {
    return adminService.deleteAdminProduct(productId);
  },

  getProducts: async (search = '', category = '', page = 1, limit = 10) => {
    return adminService.getAdminProducts(search, category, page, limit);
  },

  getProductById: async (productId) => {
    const response = await api.get(`api/products/${productId}`);
    return response.data;
  }
};

export default adminService;
