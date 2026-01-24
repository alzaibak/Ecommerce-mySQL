import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { clearCorruptedStorage } from './utils/clearStorage';

// Client Pages
import HomePage from "@/pages/client/HomePage";
import ProductsPage from "@/pages/client/ProductsPage";
import ProductDetailPage from "@/pages/client/ProductDetailPage";
import ProfilePage from "@/pages/client/ProfilePage";
import ContactPage from "@/pages/client/ContactPage";
import CartPage from "@/pages/client/CartPage";
import LoginFormPage from "@/pages/client/LoginFormPage";
import SignupPage from "@/pages/client/SignupPage";
import SuccessPaymentPage from "@/pages/client/SuccessPaymentPage";

// Admin Pages
import LoginPage from "@/pages/admin/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import UsersPage from "@/pages/admin/UsersPage";
import ProductsAdminPage from "@/pages/admin/ProductsPage";
import OrdersPage from "@/pages/admin/OrdersPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

import NotFound from "@/pages/NotFound";

// Clear any corrupted admin storage immediately
clearCorruptedStorage();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Client Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:category" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/successPayment" element={<SuccessPaymentPage />} />
            <Route path="/login" element={<LoginFormPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <ProductsAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
