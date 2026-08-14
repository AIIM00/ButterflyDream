import { Outlet } from "react-router-dom";
import CustomerFooter from "../components/customer/CustomerFooter.jsx";
import CustomerHeader from "../components/customer/CustomerHeader.jsx";
import { CartProvider } from "../context/cart/CartProvider.jsx";
import { NotificationProvider } from "../context/notification/NotificationProvider.jsx";
import { WishlistProvider } from "../context/wishlist/WishlistProvider.jsx";
import AnnouncementBar from "../components/customer/AnnouncementBar.jsx";
import SiteThemeProvider from "../context/site-theme/SiteThemeProvider.jsx";
import DraftPreviewBanner from "../components/customer/DraftPreviewBanner.jsx";
function CustomerLayout() {
  return (
    <SiteThemeProvider>
      <NotificationProvider>
        <WishlistProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col bg-white">
              <DraftPreviewBanner />
              <CustomerHeader />
              <AnnouncementBar />
              <main className="flex-1">
                <Outlet />
              </main>

              <CustomerFooter />
            </div>
          </CartProvider>
        </WishlistProvider>
      </NotificationProvider>
    </SiteThemeProvider>
  );
}

export default CustomerLayout;
