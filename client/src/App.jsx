import { Navigate, Route, Routes } from "react-router-dom";

// Configuration
import runtimeSite from "./config/runtimeSite.js";

// Protected routes
import ProtectedRoute from "./components/protected/ProtectedRoute.jsx";

// Layouts
import AdminLayout from "./layouts/AdminLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import CustomerLayout from "./layouts/CustomerLayout.jsx";

// General pages
import NotFound from "./pages/NotFound.jsx";

// Admin pages
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminOrderManage from "./pages/admin/AdminOrderManage.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder.jsx";
import AdminProductCreate from "./pages/admin/AdminProductCreate.jsx";
import AdminProductManage from "./pages/admin/AdminProductManage.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
import AdminInStoreSales from "./pages/admin/AdminInStoreSales.jsx";
import AdminInStoreSalesHistory from "./pages/admin/AdminInStoreSalesHistory.jsx";
import AdminInitialPasswordChange from "./pages/auth/AdminInitialPasswordChange.jsx";
// Authentication pages
import AdminLogin from "./pages/auth/AdminLogin.jsx";
import EmailVerification from "./pages/auth/EmailVerification.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

// Customer pages
import Account from "./pages/customer/Account.jsx";
import Cart from "./pages/customer/Cart.jsx";
import Checkout from "./pages/customer/Checkout.jsx";
import CustomerPlaceholder from "./pages/customer/CustomerPlaceholder.jsx";
import Home from "./pages/customer/Home.jsx";
import Notifications from "./pages/customer/Notifications.jsx";
import OrderDetails from "./pages/customer/OrderDetails.jsx";
import OrderSuccess from "./pages/customer/OrderSuccess.jsx";
import Orders from "./pages/customer/Orders.jsx";
import ProductDetails from "./pages/customer/ProductDetails.jsx";
import Products from "./pages/customer/Products.jsx";
import Wishlist from "./pages/customer/Wishlist.jsx";
import PopupsPage from "./pages/customer/PopupsPage.jsx";

function App() {
  const isDevelopmentRouting = runtimeSite === "development";

  const allowCustomerRoutes =
    isDevelopmentRouting || runtimeSite === "customer";

  const allowAdminRoutes = isDevelopmentRouting || runtimeSite === "admin";

  return (
    <Routes>
      {allowCustomerRoutes && (
        <>
          {/* Customer storefront */}
          <Route element={<CustomerLayout />}>
            {/* Public storefront routes */}
            <Route index element={<Home />} />

            <Route path="products" element={<Products />} />

            <Route path="products/:slug" element={<ProductDetails />} />

            <Route
              path="privacy"
              element={
                <CustomerPlaceholder
                  eyebrow="Information"
                  title="Privacy policy"
                  description="The final privacy policy will be added before the platform is launched."
                />
              }
            />

            <Route
              path="terms"
              element={
                <CustomerPlaceholder
                  eyebrow="Information"
                  title="Terms and conditions"
                  description="The final terms and conditions will be added before the platform is launched."
                />
              }
            />

            {/* Customer-only storefront routes */}
            <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
              <Route path="cart" element={<Cart />} />

              <Route path="wishlist" element={<Wishlist />} />

              <Route path="notifications" element={<Notifications />} />

              <Route path="checkout" element={<Checkout />} />

              <Route
                path="checkout/success/:orderId"
                element={<OrderSuccess />}
              />

              <Route path="account" element={<Account />} />

              <Route path="orders" element={<Orders />} />

              <Route path="orders/:orderId" element={<OrderDetails />} />
            </Route>
            <Route path="popups" element={<PopupsPage />} />
          </Route>

          {/* Customer authentication pages */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />

            <Route path="register" element={<Register />} />

            <Route path="forgot-password" element={<ForgotPassword />} />

            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* Logged-in customer email verification */}
          <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
            <Route element={<AuthLayout />}>
              <Route path="verify-email" element={<EmailVerification />} />
            </Route>
          </Route>
        </>
      )}

      {allowAdminRoutes && (
        <>
          {/*
           * Production admin hostname:
           * https://admin.butterflydream.cc/
           *
           * Local development keeps:
           * http://localhost:5173/admin/login
           */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AuthLayout />}>
              <Route
                path="admin/change-password"
                element={<AdminInitialPasswordChange />}
              />
            </Route>
          </Route>
          {runtimeSite === "admin" && (
            <Route element={<AuthLayout />}>
              <Route index element={<AdminLogin />} />
            </Route>
          )}

          {/* Admin authentication pages */}
          <Route element={<AuthLayout />}>
            <Route path="admin/login" element={<AdminLogin />} />
          </Route>

          {/* Admin-only application routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<AdminDashboard />} />

              <Route path="products" element={<AdminProducts />} />

              <Route path="products/new" element={<AdminProductCreate />} />

              <Route
                path="products/:productId"
                element={<AdminProductManage />}
              />

              <Route path="categories" element={<AdminCategories />} />

              <Route path="orders" element={<AdminOrders />} />

              <Route path="orders/:orderId" element={<AdminOrderManage />} />

              <Route path="settings" element={<AdminSettings />} />

              <Route
                path="inventory"
                element={
                  <AdminPlaceholder
                    title="Inventory"
                    description="Monitor variant stock levels and adjust available quantities."
                  />
                }
              />

              <Route
                path="customers"
                element={
                  <AdminPlaceholder
                    title="Customers"
                    description="Review customer accounts and manage account status."
                  />
                }
              />

              <Route
                path="notifications"
                element={
                  <AdminPlaceholder
                    title="Notifications"
                    description="Review store activity, order updates, and inventory alerts."
                  />
                }
              />

              <Route path="in-store-sales" element={<AdminInStoreSales />} />

              <Route
                path="in-store-sales/history"
                element={<AdminInStoreSalesHistory />}
              />
            </Route>
          </Route>
        </>
      )}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
