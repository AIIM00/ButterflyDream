import { Router } from "express";
import {
  addCartItem,
  clearCart,
  getCart,
  refreshCartPrices,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(requireAuthentication, requireRole("CUSTOMER"));

router.get("/", getCart);

router.post("/refresh-prices", refreshCartPrices);

router.post("/items", addCartItem);

router.patch("/items/:cartItemId", updateCartItem);

router.delete("/items/:cartItemId", removeCartItem);

router.delete("/", clearCart);

export default router;
