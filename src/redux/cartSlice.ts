import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

export interface CartProduct {
  id: number; // Changed from _id to id (number to match MySQL model)
  title: string;
  price: number;
  discountPrice?: number; // Added discount price
  quantity: number;
  img: string;
  // Store attributes as object for variant management
  attributes: Record<string, string>;
  variantKey?: string;
  productId: number;
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
      const product = action.payload;
      const variantKey = product.variantKey || Object.values(product.attributes).join('_');
      
      // Find existing product with same id and attributes
      const productIndex = state.products.findIndex(
        (item) => 
          item.id === product.id && 
          item.variantKey === variantKey
      );

      if (productIndex >= 0) {
        state.products[productIndex].quantity += product.quantity;
        toast.info(`Quantité ${product.quantity} ajoutée au panier`);
      } else {
        state.products.push({ ...product, variantKey });
        state.quantity += 1;
        toast.success(`${product.title} ajouté au panier`);
      }
      
      // Use discount price if available, otherwise use regular price
      const productPrice = product.discountPrice && product.discountPrice < product.price 
        ? product.discountPrice 
        : product.price;
      state.total += productPrice * product.quantity;
    },

    increaseQuantity(state, action: PayloadAction<{ id: number; variantKey?: string }>) {
      const { id, variantKey } = action.payload;
      const productIndex = state.products.findIndex(
        (item) => item.id === id && item.variantKey === variantKey
      );

      if (productIndex >= 0) {
        state.products[productIndex].quantity += 1;
        const productPrice = state.products[productIndex].discountPrice && 
          state.products[productIndex].discountPrice! < state.products[productIndex].price
          ? state.products[productIndex].discountPrice!
          : state.products[productIndex].price;
        state.total += productPrice;
      }
    },

    decreaseQuantity(state, action: PayloadAction<{ id: number; variantKey?: string }>) {
      const { id, variantKey } = action.payload;
      const productIndex = state.products.findIndex(
        (item) => item.id === id && item.variantKey === variantKey
      );

      if (productIndex >= 0 && state.products[productIndex].quantity > 1) {
        state.products[productIndex].quantity -= 1;
        const productPrice = state.products[productIndex].discountPrice && 
          state.products[productIndex].discountPrice! < state.products[productIndex].price
          ? state.products[productIndex].discountPrice!
          : state.products[productIndex].price;
        state.total -= productPrice;
      }
    },

    removeProduct(state, action: PayloadAction<{ id: number; variantKey?: string; title: string }>) {
      const { id, variantKey, title } = action.payload;
      const productIndex = state.products.findIndex(
        (item) => item.id === id && item.variantKey === variantKey
      );

      if (productIndex >= 0) {
        const product = state.products[productIndex];
        const productPrice = product.discountPrice && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;
        state.total -= productPrice * product.quantity;
        state.quantity -= 1;
        state.products.splice(productIndex, 1);
        toast.error(`${title} supprimé du panier`);
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