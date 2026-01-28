const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import {store} from "../redux/store";


/* ============================
   FETCH WRAPPER
============================ */
export const ensureNumericData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => ensureNumericData(item));
  }
  
  if (data && typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      if (key === 'price' || key === 'subtotal' || key === 'shipping' || key === 'total' || key === 'amount') {
        const val = data[key];
        result[key] = typeof val === 'string' ? parseFloat(val) || 0 : val || 0;
      } else if (Array.isArray(data[key])) {
        result[key] = data[key].map((item: any) => ensureNumericData(item));
      } else {
        result[key] = data[key];
      }
    }
    return result;
  }
  
  return data;
};

// Then update your fetchAPI wrapper:
export async function fetchAPI(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean; skipNumericCheck?: boolean } = {}
) {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && !options.skipAuth && {
      Authorization: `Bearer ${token}`,
    }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "API error",
    }));

    throw {
      message: error.message || "API error",
      status: response.status,
    };
  }

  const data = await response.json();
  
  // Automatically convert numeric fields if not skipped
  if (!options.skipNumericCheck) {
    return ensureNumericData(data);
  }
  
  return data;
}
/* ============================
   SINGLE TOKEN SOURCE (REDUX)
============================ */
const getToken = () => {
  return store.getState().user.token;
};



// Default API object for simple usage
const api = {
  get: (endpoint: string) => fetchAPI(endpoint),
  post: (endpoint: string, data: unknown) =>
    fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: unknown) =>
    fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => fetchAPI(endpoint, { method: 'DELETE' }),
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),

  register: (data: any) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
};

// Users API
export const usersAPI = {
  getAll: () => fetchAPI('/users'),
  getById: (id: number) => fetchAPI(`/users/find/${id}`),
  update: (id: number, data: Record<string, unknown>) =>
    fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/users/${id}`, { method: 'DELETE' }),
  getStats: () => fetchAPI('/users/stats'),
};

// Categories API
export const categoriesAPI = {
  getAll: () => fetchAPI('/categories'),
  getById: (id: number) => fetchAPI(`/categories/${id}`),
  create: (data: Record<string, unknown>) => 
    fetchAPI('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/categories/${id}`, { method: 'DELETE' }),
};

// Products API
export const productsAPI = {
  getAll: (params?: { 
    new?: boolean; 
    category?: string | number;
    featured?: boolean;
    limit?: number;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.new) queryParams.append('new', 'true');
    if (params?.category) queryParams.append('category', params.category.toString());
    if (params?.featured) queryParams.append('featured', 'true');
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const query = queryParams.toString();
    return fetchAPI(`/products${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => fetchAPI(`/products/find/${id}`),
  create: (data: Record<string, unknown>) =>
    fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/products/${id}`, { method: 'DELETE' }),
  updateAttributes: (id: number, attributes: Record<string, any>) =>
    fetchAPI(`/products/${id}/attributes`, { 
      method: 'PUT', 
      body: JSON.stringify({ attributes }) 
    }),
  updateVariantStock: (id: number, stockByVariant: Record<string, number>) =>
    fetchAPI(`/products/${id}/stock-by-variant`, {
      method: 'PUT',
      body: JSON.stringify({ stockByVariant })
    }),
  uploadImage: (formData: FormData) =>
    fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    }).then(res => res.json()),
};

// Orders API - Updated with new methods
export const ordersAPI = {
  getAll: (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    
    const query = queryParams.toString();
    return fetchAPI(`/orders${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => fetchAPI(`/orders/${id}`),
  getByPaymentIntent: (paymentIntentId: string) =>
    fetchAPI(`/orders/payment-intent/${paymentIntentId}`),
  getMyOrders: () => fetchAPI("/orders/user/orders"),
  create: (data: Record<string, unknown>) =>
    fetchAPI('/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    fetchAPI(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/orders/${id}`, { method: 'DELETE' }),
  getIncome: () => fetchAPI("/orders/income"),
  getStats: () => fetchAPI('/orders/stats'),
  exportToCSV: (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const query = queryParams.toString();
    return fetch(`${API_BASE_URL}/orders/export/csv${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    }).then(res => res.blob());
  },
  updateStatus: (id: number, status: string, note?: string) =>
    fetchAPI(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note })
    }),
};

// Order Items API - Updated with new methods
export const orderItemsAPI = {
  getByOrder: (orderId: number) => fetchAPI(`/orders/items/order/${orderId}`),
  getById: (id: number) => fetchAPI(`/orders/items/${id}`),
  create: (orderId: number, data: Record<string, unknown>) =>
    fetchAPI(`/orders/${orderId}/items`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    fetchAPI(`/orders/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/orders/items/${id}`, { method: 'DELETE' }),
  getByProduct: (productId: number) => fetchAPI(`/orders/items/product/${productId}`),
  batchUpdate: (orderId: number, items: Array<{
    id?: number;
    productId: number;
    quantity: number;
    price: number;
    title: string;
    attributes?: Record<string, any>;
  }>) =>
    fetchAPI(`/orders/${orderId}/items/batch`, {
      method: 'POST',
      body: JSON.stringify({ items })
    }),
};

// Cart API
export const cartAPI = {
  getAll: () => fetchAPI('/carts'),
  getByUser: (userId: number) => fetchAPI(`/carts/find/${userId}`),
  update: (userId: number, data: Record<string, unknown>) =>
    fetchAPI(`/carts/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  clear: (userId: number) => fetchAPI(`/carts/${userId}/clear`, { method: 'PUT' }),
};

// Contact API
export const contactAPI = {
  getAll: () => fetchAPI('/contact'),
  getById: (id: number) => fetchAPI(`/contact/${id}`),
  create: (data: Record<string, unknown>) =>
    fetchAPI('/contact', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    fetchAPI(`/contact/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/contact/${id}`, { method: 'DELETE' }),
  markAsRead: (id: number) =>
    fetchAPI(`/contact/${id}/read`, { method: 'PUT' }),
};

// Stripe API
export const stripeAPI = {
  create: (data: Record<string, unknown>) =>
    fetchAPI('/stripe/create-checkout-session', { method: 'POST', body: JSON.stringify(data) }),
  webhook: (data: Record<string, unknown>) =>
    fetchAPI('/stripe/webhook', { method: 'POST', body: JSON.stringify(data) }),
  getPaymentMethods: () => fetchAPI('/stripe/payment-methods'),
};

// Dashboard API for aggregated stats
export const dashboardAPI = {
  getStats: () => fetchAPI('/dashboard/stats'),
  getRecentOrders: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return fetchAPI(`/dashboard/recent-orders${query}`);
  },
  getTopProducts: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return fetchAPI(`/dashboard/top-products${query}`);
  },
  getSalesChartData: (period: 'day' | 'week' | 'month' | 'year') =>
    fetchAPI(`/dashboard/sales-chart?period=${period}`),
};

// Export API for data export functionality
export const exportAPI = {
  orders: {
    csv: (params?: { startDate?: string; endDate?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const query = queryParams.toString();
      return fetch(`${API_BASE_URL}/export/orders/csv${query ? `?${query}` : ''}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }).then(res => res.blob());
    },
    pdf: (orderId: number) =>
      fetch(`${API_BASE_URL}/export/orders/${orderId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }).then(res => res.blob()),
  },
  products: {
    csv: () =>
      fetch(`${API_BASE_URL}/export/products/csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      }).then(res => res.blob()),
  },
};

// Notification API
export const notificationAPI = {
  getAll: () => fetchAPI('/notifications'),
  markAsRead: (id: number) =>
    fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () =>
    fetchAPI('/notifications/read-all', { method: 'PUT' }),
  create: (data: Record<string, unknown>) =>
    fetchAPI('/notifications', { method: 'POST', body: JSON.stringify(data) }),
};

export default api;