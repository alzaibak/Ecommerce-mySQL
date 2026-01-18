import { createSlice } from "@reduxjs/toolkit";

const userConfiguration = createSlice({
    name: "user",
    initialState: {
        currantUser: null,
        isFetching: false,
        error:false,
    },
    reducers: {
        loginStarting: (state)=> {
            state.isFetching= true;
        },
        loginStatus: (state,action)=>{
            state.isFetching= false;
            state.currantUser= action.payload;
        },
        loginFailure: (state)=>{
            state.isFetching= false;
            state.error= true;
        },
        logOut: (state)=>{
            state.currantUser = null;

        },
    },
});

export const {loginStarting, loginStatus, loginFailure, logOut} = userConfiguration.actions;
export default userConfiguration.reducer;
