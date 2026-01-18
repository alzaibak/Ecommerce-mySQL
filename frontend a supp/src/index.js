import React from 'react';
//import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from "react-redux";
import  {store, persistor}  from "./Redux/store";
import { PersistGate } from 'redux-persist/integration/react';
import ReactDOM from "react-dom/client";
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <Provider store= {store}>
    <PersistGate loading={null} persistor={persistor}>
    <App />
    </PersistGate>
    <ToastContainer/>
  </Provider>,
);