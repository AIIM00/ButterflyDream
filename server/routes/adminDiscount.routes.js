import { Router } from "express";
import prisma from "../src/prisma.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";
import { DiscountError } from "../services/discountService.js";
import { parseCampaign, requireDiscountId } from "../utils/discountValidation.js";
import { successResponse } from "../utils/apiResponse.js";

const router = Router();
router.use(requireAuthentication, requireRole("ADMIN"), requireCompletedAdminPasswordChange);
const include = {
  includedProducts: { select: { id: true, name: true } },
  excludedProducts: { select: { id: true, name: true } },
  assignedCustomers: { select: { id: true, fullName: true, email: true } },
};
router.get("/", async (_req, res, next) => {
  try {
    const campaigns = await prisma.discountCampaign.findMany({ include, orderBy: { createdAt: "desc" }, take: 500 });
    return successResponse(res, 200, "Campaigns retrieved.", { campaigns });
  } catch (error) { next(error); }
});
router.get("/options", async (_req, res, next) => {
  try {
    const [products, customers] = await Promise.all([
      prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.user.findMany({ where: { role: "CUSTOMER", status: "ACTIVE", deletedAt: null }, select: { id: true, fullName: true, email: true }, orderBy: { fullName: "asc" } }),
    ]);
    return successResponse(res, 200, "Campaign options retrieved.", { products, customers });
  } catch (error) { next(error); }
});
router.get("/:id/redemptions", async (req, res, next) => {
  try {
    const redemptions = await prisma.discountRedemption.findMany({
      where: { campaignId: requireDiscountId(req.params.id) }, orderBy: { createdAt: "desc" }, take: 100,
      include: { order: { select: { orderNumber: true, status: true, discountSnapshot: true } } },
    });
    return successResponse(res, 200, "Redemption history retrieved.", { redemptions });
  } catch (error) { next(error); }
});
async function save(req, res, next) {
  try {
    const input = parseCampaign(req.body);
    const { includedProductIds, excludedProductIds, assignedCustomerIds, ...fields } = input;
    const id = req.params.id ? requireDiscountId(req.params.id) : null;
    const campaign = await prisma.$transaction(async tx => {
      const customers = await tx.user.count({ where: { id: { in: assignedCustomerIds }, role: "CUSTOMER", status: "ACTIVE", deletedAt: null } });
      const products = await tx.product.count({ where: { id: { in: [...includedProductIds, ...excludedProductIds] } } });
      if (customers !== assignedCustomerIds.length || products !== includedProductIds.length + excludedProductIds.length) throw new DiscountError("Some selected products or customers are unavailable.", 400);
      if (id) {
        const current = await tx.discountCampaign.findUnique({ where: { id } });
        if (!current) throw new DiscountError("Campaign not found.", 404);
        if (fields.maxRedemptions != null && fields.maxRedemptions < current.usedCount) throw new DiscountError("Usage limit cannot be below current usage.", 400);
        if (req.body.updatedAt !== current.updatedAt.toISOString()) throw new DiscountError("Campaign changed. Reload before saving.");
      }
      const relations = {
        includedProducts: { [id ? "set" : "connect"]: includedProductIds.map(id => ({ id })) },
        excludedProducts: { [id ? "set" : "connect"]: excludedProductIds.map(id => ({ id })) },
        assignedCustomers: { [id ? "set" : "connect"]: assignedCustomerIds.map(id => ({ id })) },
      };
      return id ? tx.discountCampaign.update({ where: { id }, data: { ...fields, ...relations }, include })
        : tx.discountCampaign.create({ data: { ...fields, ...relations }, include });
    }, { isolationLevel: "Serializable" });
    return successResponse(res, id ? 200 : 201, "Campaign saved.", { campaign });
  } catch (error) {
    if (error.code === "P2002") return next(new DiscountError("This code already belongs to another campaign.", 409));
    if (error.code === "P2034") return next(new DiscountError("Campaign changed. Reload before saving.", 409));
    next(error);
  }
}
router.post("/", save);
router.put("/:id", save);
export default router;
