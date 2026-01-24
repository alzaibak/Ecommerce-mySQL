const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import {store} from "../redux/store";

/* ============================
   SINGLE TOKEN SOURCE (REDUX)
============================ */
const getToken = () => {
  return store.getState().user.token;
};

/* ============================
   FETCH WRAPPER
============================ */
export async function fetchAPI(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {}
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

  return response.json();
}



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
      skipAuth: true, // 🔥 IMPORTANT
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
  getAll: () => fetchAPI("/orders"),               // Admin only
  getById: (id: number) => fetchAPI(`/orders/${id}`), // Admin or owner
  getByPaymentIntent: (paymentIntentId: string) =>
    fetchAPI(`/orders/payment-intent/${paymentIntentId}`),
  getMyOrders: () => fetchAPI("/orders/user/orders"),
  update: (id: number, data: Record<string, unknown>) =>
    fetchAPI(`/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/orders/${id}`, { method: "DELETE" }),
  getIncome: () => fetchAPI("/orders/income"),
};


// Cart API
export const cartAPI = {
  getAll: () => fetchAPI('/carts'),
  getByUser: (userId: number) => fetchAPI(`/carts/find/${userId}`),
};

// Contact API
export const contactAPI = {
  create: (data: Record<string, unknown>) =>
    fetchAPI('/contact', { method: 'POST', body: JSON.stringify(data) }),
};

// Stripe API
export const stripeAPI = {
  create: (data: Record<string, unknown>) =>
    fetchAPI('/stripe/create-checkout-session', { method: 'POST', body: JSON.stringify(data) }),
};

export default api;
