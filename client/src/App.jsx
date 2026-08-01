import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/protected/ProtectedRoute.jsx";

// Layouts
import AdminLayout from "./layouts/AdminLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import CustomerLayout from "./layouts/CustomerLayout.jsx";

// Pages
import NotFound from "./pages/NotFound.jsx";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder.jsx";
import AdminLogin from "./pages/auth/AdminLogin.jsx";
import AdminOtpVerification from "./pages/auth/AdminOtpVerification.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminProductCreate from "./pages/admin/AdminProductCreate.jsx";
import AdminProductManage from "./pages/admin/AdminProductManage.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminOrderManage from "./pages/admin/AdminOrderManage.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";
// Auth pages
import EmailVerification from "./pages/auth/EmailVerification.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

// Customer pages
import CustomerPlaceholder from "./pages/customer/CustomerPlaceholder.jsx";
import Home from "./pages/customer/Home.jsx";
import ProductDetails from "./pages/customer/ProductDetails.jsx";
import Products from "./pages/customer/Products.jsx";
import Cart from "./pages/customer/Cart.jsx";
import Checkout from "./pages/customer/Checkout.jsx";
import OrderSuccess from "./pages/customer/OrderSuccess.jsx";
import Account from "./pages/customer/Account.jsx";
import Orders from "./pages/customer/Orders.jsx";
import OrderDetails from "./pages/customer/OrderDetails.jsx";
import Wishlist from "./pages/customer/Wishlist.jsx";
import Notifications from "./pages/customer/Notifications.jsx";

function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<Home />} />

        <Route path="products" element={<Products />} />

        <Route path="products/:slug" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="notifications" element={<Notifications />} />

        <Route path="checkout" element={<Checkout />} />
        <Route path="checkout/success/:orderId" element={<OrderSuccess />} />
        <Route path="account" element={<Account />} />

        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
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

        <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
          <Route
            path="wishlist"
            element={
              <CustomerPlaceholder
                eyebrow="Your account"
                title="Wishlist"
                description="Your saved products will appear here after the wishlist interface is connected."
              />
            }
          />

          <Route
            path="cart"
            element={
              <CustomerPlaceholder
                eyebrow="Shopping"
                title="Your cart"
                description="Selected products and variants will appear here after the cart feature is implemented."
              />
            }
          />

          <Route
            path="orders"
            element={
              <CustomerPlaceholder
                eyebrow="Your account"
                title="Your orders"
                description="Your order history and delivery status will appear here."
              />
            }
          />

          <Route
            path="account"
            element={
              <CustomerPlaceholder
                eyebrow="Your account"
                title="Account settings"
                description="Your profile, phone number, addresses, and security settings will appear here."
              />
            }
          />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />

        <Route path="register" element={<Register />} />

        <Route path="forgot-password" element={<ForgotPassword />} />

        <Route path="reset-password" element={<ResetPassword />} />

        <Route path="admin/login" element={<AdminLogin />} />

        <Route path="admin/verify-otp" element={<AdminOtpVerification />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
        <Route element={<AuthLayout />}>
          <Route path="verify-email" element={<EmailVerification />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="products" element={<AdminProducts />} />

          <Route path="products/new" element={<AdminProductCreate />} />

          <Route path="products/:productId" element={<AdminProductManage />} />

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

          <Route
            path="settings"
            element={
              <AdminPlaceholder
                title="Store settings"
                description="Manage store information, contact details, currency settings, and operational preferences."
              />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
