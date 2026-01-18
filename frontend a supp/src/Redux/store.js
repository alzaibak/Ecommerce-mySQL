import { combineReducers, configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartRedux";
import userReducer from "./userRedux";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
  } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
  const persistConfig = {
    key: 'root',
    version: 1,
    storage,
  }
  
  const persistedReducers =  combineReducers({user:userReducer, cart:cartReducer});
  //const userPersistedReducer = persistReducer(persistConfig, userReducer);
  //const cartPersistedReducer = persistReducer(persistConfig, cartReducer);
  const allPersistedReducer = persistReducer(persistConfig, persistedReducers);


export const store = configureStore({
    reducer: allPersistedReducer,
    //{
       // cart: cartPersistedReducer,
     //   user: userPersistedReducer,
   // },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),

})


export let persistor = persistStore(store);