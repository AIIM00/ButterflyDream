import { Router } from "express";
import {
  createAddress,
  listCustomerAddresses,
  makeDefaultAddress,
  removeAddress,
  updateAddress,
} from "../controllers/customerAddress.controller.js";
import {
  getCustomerOrder,
  listCustomerOrders,
} from "../controllers/customerOrder.controller.js";
import {
  addWishlistItem,
  listCustomerWishlist,
  removeWishlistItem,
} from "../controllers/customerWishlist.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

import {
  getUnreadNotificationCount,
  listCustomerNotifications,
  readAllNotifications,
  readNotification,
  removeNotification,
  removeReadNotifications,
} from "../controllers/customerNotification.controller.js";

const router = Router();

router.use(requireAuthentication, requireRole("CUSTOMER"));

// Customer addresses

router.get("/addresses", listCustomerAddresses);

router.post("/addresses", createAddress);

router.patch("/addresses/:addressId", updateAddress);

router.patch("/addresses/:addressId/default", makeDefaultAddress);

router.delete("/addresses/:addressId", removeAddress);

// Customer wishlist

router.get("/wishlist", listCustomerWishlist);

router.post("/wishlist/items", addWishlistItem);

router.delete("/wishlist/items/:productId", removeWishlistItem);

// Customer notifications
// Customer notifications

router.get("/notifications/unread-count", getUnreadNotificationCount);

router.get("/notifications", listCustomerNotifications);

router.patch("/notifications/read-all", readAllNotifications);

router.patch("/notifications/:notificationId/read", readNotification);

router.delete("/notifications/read", removeReadNotifications);

router.delete("/notifications/:notificationId", removeNotification);

// Customer orders

router.get("/orders", listCustomerOrders);

router.get("/orders/:orderId", getCustomerOrder);

export default router;
