import axios from "axios";

const BASE_URL = "http://localhost:5000/api/";

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
});

// Add token interceptor
userRequest.interceptors.request.use(
  (config) => {
    try {
      const persistedState = localStorage.getItem("persist:root");
      if (persistedState) {
        const rootState = JSON.parse(persistedState);
        const userState = JSON.parse(rootState.user);
        if (userState?.currentUser?.accessToken) {
          config.headers.token = `Bearer ${userState.currentUser.accessToken}`;
        }
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
