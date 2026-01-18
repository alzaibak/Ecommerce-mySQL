import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

export interface CartProduct {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  img: string;
  color?: string;
  size?: string;
}

interface CartState {
  products: CartProduct[];
  quantity: number;
  total: number;
}

const initialState: CartState = {
  products: [],
  quantity: 0,
  total: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProduct(state, action: PayloadAction<CartProduct>) {
      const productIndex = state.products.findIndex(
        (item) =>
          item._id === action.payload._id &&
          item.color === action.payload.color &&
          item.size === action.payload.size
      );

      if (productIndex >= 0) {
        state.products[productIndex].quantity += action.payload.quantity;
        toast.info(`Quantité ${action.payload.quantity} ajoutée au panier`);
      } else {
        state.products.push(action.payload);
        state.quantity += 1;
        toast.success(`${action.payload.title} ajouté au panier`);
      }
      state.total += action.payload.price * action.payload.quantity;
    },

    increaseQuantity(state, action: PayloadAction<{ _id: string; color?: string; size?: string }>) {
      const productIndex = state.products.findIndex(
        (item) =>
          item._id === action.payload._id &&
          item.color === action.payload.color &&
          item.size === action.payload.size
      );

      if (productIndex >= 0) {
        state.products[productIndex].quantity += 1;
        state.total += state.products[productIndex].price;
      }
    },

    decreaseQuantity(state, action: PayloadAction<{ _id: string; color?: string; size?: string }>) {
      const productIndex = state.products.findIndex(
        (item) =>
          item._id === action.payload._id &&
          item.color === action.payload.color &&
          item.size === action.payload.size
      );

      if (productIndex >= 0 && state.products[productIndex].quantity > 1) {
        state.products[productIndex].quantity -= 1;
        state.total -= state.products[productIndex].price;
      }
    },

    removeProduct(state, action: PayloadAction<{ _id: string; color?: string; size?: string; title: string }>) {
      const productIndex = state.products.findIndex(
        (item) =>
          item._id === action.payload._id &&
          item.color === action.payload.color &&
          item.size === action.payload.size
      );

      if (productIndex >= 0) {
        state.total -= state.products[productIndex].price * state.products[productIndex].quantity;
        state.quantity -= 1;
        state.products.splice(productIndex, 1);
        toast.error(`${action.payload.title} supprimé du panier`);
      }
    },

    clearCart(state) {
      state.products = [];
      state.quantity = 0;
      state.total = 0;
      toast.success("Panier vidé");
    },
  },
});

export const { addProduct, increaseQuantity, decreaseQuantity, removeProduct, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
