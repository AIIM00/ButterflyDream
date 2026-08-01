import { Outlet } from "react-router-dom";
import CustomerFooter from "../components/customer/CustomerFooter.jsx";
import CustomerHeader from "../components/customer/CustomerHeader.jsx";
import { CartProvider } from "../context/cart/CartProvider.jsx";
import { NotificationProvider } from "../context/notification/NotificationProvider.jsx";
import { WishlistProvider } from "../context/wishlist/WishlistProvider.jsx";

function CustomerLayout() {
  return (
    <NotificationProvider>
      <WishlistProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col bg-white">
            <CustomerHeader />

            <main className="flex-1">
              <Outlet />
            </main>

            <CustomerFooter />
          </div>
        </CartProvider>
      </WishlistProvider>
    </NotificationProvider>
  );
}

export default CustomerLayout;
