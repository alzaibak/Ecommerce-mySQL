import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadInitialState = () => {
  try {
    const persistedState = localStorage.getItem("persist:root");
    if (persistedState) {
      const rootState = JSON.parse(persistedState);
      const userState = JSON.parse(rootState.user);
      if (userState?.currentUser) {
        return { currentUser: userState.currentUser, isFetching: false, error: false };
      }
    }
  } catch (error) {
    console.error("Error loading state:", error);
  }
  return { currentUser: null, isFetching: false, error: false };
};

const userSlice = createSlice({
  name: "user",
  initialState: loadInitialState(),
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    loginSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload;
      state.error = false;
    },
    loginFailure: (state) => {
      state.isFetching = false;
      state.error = true;
      state.currentUser = null;
    },
    logout: (state) => {
      state.currentUser = null;
      state.error = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer;
