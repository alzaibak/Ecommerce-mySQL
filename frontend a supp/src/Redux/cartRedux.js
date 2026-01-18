import { createSlice } from "@reduxjs/toolkit";
import {toast} from "react-toastify"

const cartConfiguration = createSlice({
    name: "cart",
    initialState: {
        products: [],
        quantity: 0,
        total:0,
    },
    reducers: {
        addingProduct(state,action){
            const productExist = state.products.findIndex(
                (item) =>
                {
                    return item._id === action.payload._id 
                        && item.color === action.payload.color 
                        && item.size === action.payload.size; 
                });
            if (productExist>=0) {
                    state.products[productExist].quantity += action.payload.quantity;
                    toast.info(`La quantité ${action.payload.quantity} rajouter au panier`, {position:"bottom-left", className:"addingInfo"})
            }else {
                state.products.push(action.payload);
                state.quantity +=1;
                toast.success(`${action.payload.title} ${action.payload.color} et ${action.payload.size} est ajouté au panier`, {position:"bottom-left", className:"addingInfo"})
            }
            state.total += (action.payload.price * action.payload.quantity);
        }, increasingQuantity(state,action){
            const productExist = state.products.findIndex(
                (item) =>
                {
                    return item._id === action.payload._id
                        && item.color === action.payload.color
                        && item.size === action.payload.size;
                });
                state.total = state.total + state.products[productExist].price
                state.products[productExist].quantity += 1;
                
        }, decreasingQuantity(state,action){
            const productExist = state.products.findIndex(
                (item) =>
                {
                    return item._id === action.payload._id
                        && item.color === action.payload.color
                        && item.size === action.payload.size;
                });
                if ( state.products[productExist].quantity > 1) {
                    state.products[productExist].quantity -= 1;
                    state.total -= state.products[productExist].price;
                }
        },
        deletingProduct(state,action){
            const productExist = state.products.findIndex(
                (item) =>
                {
                    return item._id === action.payload._id
                        && item.color === action.payload.color
                        && item.size === action.payload.size;
                });
                    //product = state.products[productExist];
                    state.total -= state.products[productExist].price * state.products[productExist].quantity;
                    state.quantity -= 1;
                    state.products.splice(productExist,1);
                    //localStorage.setItem("products", JSON.stringify(state.products[productExist]))
                
            toast.error(`La ${action.payload.title} est supprimer`, {position:"bottom-left", className:"addingInfo"})
        },
        clearCart(state){
            state.products = [];
            state.quantity = 0;
            state.total = 0;
        }
    },
});

export const {addingProduct, clearCart, deletingProduct, decreasingQuantity, increasingQuantity } = cartConfiguration.actions;
export default cartConfiguration.reducer;
