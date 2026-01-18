import { loginFailure, loginStart, loginSuccess } from "./userRedux";
import { publicRequest, userRequest } from "../requestMethods";
import {
  getProductFailure,
  getProductStart,
  getProductSuccess,
  deleteProductFailure,
  deleteProductStart,
  deleteProductSuccess,
  updateProductFailure,
  updateProductStart,
  updateProductSuccess,
  addProductFailure,
  addProductStart,
  addProductSuccess,
} from "./productRedux";

export const login = async (dispatch, user) => {
  dispatch(loginStart());
  try {
    // Admin login endpoint
    const res = await publicRequest.post("/auth/admin/login", {
      email: user.email,
      password: user.password
    });
    // Transform response to match expected format
    const loginData = {
      ...res.data.user,
      accessToken: res.data.token
    };
    dispatch(loginSuccess(loginData));
    return res.data;
  } catch (err) {
    dispatch(loginFailure());
    throw err;
  }
};

export const getProducts = async (dispatch) => {
  dispatch(getProductStart());
  try {
    const res = await publicRequest.get("/products");
    dispatch(getProductSuccess(res.data));
  } catch (err) {
    dispatch(getProductFailure());
  }
};

export const deleteProduct = async (id, dispatch) => {
  dispatch(deleteProductStart());
  try {
    // Convert _id to id - _id is string of number, id is number
    const productId = typeof id === 'string' ? id : String(id);
    await userRequest.delete(`/products/${productId}`);
    dispatch(deleteProductSuccess(id));
    alert("Product deleted successfully!");
  } catch (err) {
    console.error("Delete product error:", err);
    alert(err.response?.data?.message || "Failed to delete product");
    dispatch(deleteProductFailure());
  }
};

export const updateProduct = async (id, product, dispatch) => {
  dispatch(updateProductStart());
  try {
    const res = await userRequest.put(`/products/${id}`, product);
    dispatch(updateProductSuccess(res.data));
  } catch (err) {
    dispatch(updateProductFailure());
  }
};
export const addProduct = async (product, dispatch) => {
  dispatch(addProductStart());
  try {
    const res = await userRequest.post(`/products`, product);
    dispatch(addProductSuccess(res.data));
    alert("Product created successfully!");
    return res.data;
  } catch (err) {
    console.error("Add product error:", err);
    alert(err.response?.data?.message || "Failed to create product. Check console for details.");
    dispatch(addProductFailure());
    throw err;
  }
};
