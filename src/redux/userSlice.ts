import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserInfo {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  isAdmin?: boolean;
}

interface UserState {
  currentUser: { userInfo: UserInfo; token: string } | null;
  isFetching: boolean;
  error: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isFetching: false,
  error: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart(state) {
      state.isFetching = true;
      state.error = false;
    },

    loginSuccess(state, action: PayloadAction<{ userInfo: UserInfo; token: string }>) {
      state.isFetching = false;
      state.currentUser = action.payload;
      state.error = false;
    },

    loginFailure(state) {
      state.isFetching = false;
      state.error = true;
    },

    logout(state) {
      state.currentUser = null;
      state.isFetching = false;
      state.error = false;
    },

    updateUser(state, action: PayloadAction<Partial<UserInfo>>) {
      if (state.currentUser) {
        state.currentUser.userInfo = { ...state.currentUser.userInfo, ...action.payload };
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
