import { customerMetrics, customerDirectory } from "../services/adminCustomerInsights.js";
import { successResponse } from "../utils/apiResponse.js";
import { Router } from "express";
import {
  getAdminCustomer,
  listAdminCustomers,
} from "../controllers/adminCustomer.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";

const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);

router.get("/", listAdminCustomers);
for (const [path, read] of [["/metrics", customerMetrics], ["/directory", customerDirectory]]) {
  router.get(path, async (req, res, next) => {
    try {
      return successResponse(res, 200, "Customer dashboard retrieved.", await read(req.query));
    } catch (error) { next(error); }
  });
}
router.get("/:customerId", getAdminCustomer);

export default router;
