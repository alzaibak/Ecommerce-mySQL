const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('userToken');

// Generic fetch wrapper
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  console.log("Fetching URL:", `${API_BASE_URL}${endpoint}`);
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { token: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error);
  }

  return response.json();
}

// Default API object for simple usage
const api = {
  get: (endpoint: string) => fetchAPI(endpoint),
  post: (endpoint: string, data: unknown) => fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: unknown) => fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => fetchAPI(endpoint, { method: 'DELETE' }),
};

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (userData: { firstName: string; lastName: string; email: string; password: string }) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
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

// Products API
export const productsAPI = {
  getAll: (params?: { new?: boolean; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.new) queryParams.append('new', 'true');
    if (params?.category) queryParams.append('category', params.category);
    const query = queryParams.toString();
    return fetchAPI(`/products${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => fetchAPI(`/products/find/${id}`),
  create: (data: Record<string, unknown>) =>
    fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/products/${id}`, { method: 'DELETE' }),
};

// Orders API
export const ordersAPI = {
  getAll: () => fetchAPI('/orders'),
  getById: (id: number) => fetchAPI(`/orders/find/${id}`),
  getByPaymentIntent: (paymentIntentId: string) =>
    fetchAPI(`/orders/payment-intent/${paymentIntentId}`), // NEW
  getByUser: (userId: number) => fetchAPI(`/orders/user/${userId}`),
  update: (id: number, data: Record<string, unknown>) =>
    fetchAPI(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/orders/${id}`, { method: 'DELETE' }),
  getIncome: () => fetchAPI('/orders/income'),
};

// Cart API
export const cartAPI = {
  getAll: () => fetchAPI('/carts'),
  getByUser: (userId: number) => fetchAPI(`/carts/find/${userId}`),
};

// Contact API
export const contactAPI = {
  create: (data: Record<string, unknown>) =>
    fetchAPI('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }),
};

// payment API
export const stripeAPI = {
  create: (data: Record<string, unknown>) =>
    fetchAPI('/stripe/create-checkout-session', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};


