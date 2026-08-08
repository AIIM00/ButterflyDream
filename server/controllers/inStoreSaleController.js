import {
  getInStoreSales,
  recordInStoreSale,
  searchInStoreSaleProducts,
} from "../services/inStoreSaleService.js";

const ALLOWED_PAYMENT_METHODS = new Set(["CASH", "CARD", "OTHER"]);

const MAX_ITEMS_PER_SALE = 100;

export async function createInStoreSale(req, res) {
  try {
    const {
      paymentMethod,
      discountAmount = 0,
      customerName = null,
      customerPhone = null,
      note = null,
      items,
    } = req.body ?? {};

    // ---------------------------------------------
    // Authentication
    // ---------------------------------------------

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ---------------------------------------------
    // Payment method validation
    // ---------------------------------------------

    if (
      typeof paymentMethod !== "string" ||
      !ALLOWED_PAYMENT_METHODS.has(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be CASH, CARD, or OTHER.",
      });
    }

    // ---------------------------------------------
    // Items validation
    // ---------------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one sale item is required.",
      });
    }

    if (items.length > MAX_ITEMS_PER_SALE) {
      return res.status(400).json({
        success: false,
        message: `A sale cannot contain more than ${MAX_ITEMS_PER_SALE} items.`,
      });
    }

    for (const item of items) {
      if (
        !item ||
        typeof item.variantId !== "string" ||
        item.variantId.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Every sale item must contain a valid variantId.",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Every sale item must have a positive integer quantity.",
        });
      }
    }

    // ---------------------------------------------
    // Discount validation
    // ---------------------------------------------

    const parsedDiscountAmount = Number(discountAmount);

    if (!Number.isFinite(parsedDiscountAmount) || parsedDiscountAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount amount must be a valid non-negative number.",
      });
    }

    // ---------------------------------------------
    // Optional customer information
    // ---------------------------------------------

    if (
      customerName !== null &&
      customerName !== undefined &&
      typeof customerName !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer name must be a string.",
      });
    }

    if (typeof customerName === "string" && customerName.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: "Customer name cannot exceed 120 characters.",
      });
    }

    if (
      customerPhone !== null &&
      customerPhone !== undefined &&
      typeof customerPhone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer phone must be a string.",
      });
    }

    if (typeof customerPhone === "string" && customerPhone.trim().length > 30) {
      return res.status(400).json({
        success: false,
        message: "Customer phone cannot exceed 30 characters.",
      });
    }

    if (note !== null && note !== undefined && typeof note !== "string") {
      return res.status(400).json({
        success: false,
        message: "Note must be a string.",
      });
    }

    // ---------------------------------------------
    // Record the physical-store sale
    // ---------------------------------------------

    const sale = await recordInStoreSale({
      adminUserId: req.user.id,

      paymentMethod,

      discountAmount: parsedDiscountAmount,

      customerName:
        typeof customerName === "string" ? customerName.trim() : null,

      customerPhone:
        typeof customerPhone === "string" ? customerPhone.trim() : null,

      note: typeof note === "string" ? note.trim() : null,

      items: items.map((item) => ({
        variantId: item.variantId.trim(),
        quantity: Number(item.quantity),
      })),
    });

    return res.status(201).json({
      success: true,
      message: "In-store sale recorded successfully.",
      data: {
        sale,
      },
    });
  } catch (error) {
    console.error("Create in-store sale error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to record in-store sale.";

    // Inventory conflicts
    if (
      message.includes("Not enough stock") ||
      message.includes("Stock changed")
    ) {
      return res.status(409).json({
        success: false,
        message,
      });
    }

    // Expected business-rule errors
    if (
      message.includes("not found") ||
      message.includes("not available for sale") ||
      message.includes("Inventory does not exist") ||
      message.includes("Invalid") ||
      message.includes("Discount cannot") ||
      message.includes("At least one") ||
      message.includes("Only an admin") ||
      message.includes("Admin account is not active")
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to record in-store sale.",
    });
  }
}

export async function getInStoreSaleProducts(req, res) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : "";

    const limit = typeof req.query.limit === "string" ? req.query.limit : 20;

    if (search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search cannot exceed 100 characters.",
      });
    }

    const products = await searchInStoreSaleProducts({
      search,
      limit,
    });

    return res.status(200).json({
      success: true,

      data: {
        products,
      },
    });
  } catch (error) {
    console.error("Get in-store sale products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load products for the in-store sale.",
    });
  }
}
export async function getInStoreSalesHistory(req, res) {
  try {
    const {
      page = "1",
      limit = "20",
      search = "",
      status = "",
      paymentMethod = "",
      dateFrom = "",
      dateTo = "",
    } = req.query ?? {};

    if (typeof search === "string" && search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search cannot exceed 100 characters.",
      });
    }

    const allowedStatuses = new Set(["", "COMPLETED", "CANCELLED", "REFUNDED"]);

    if (typeof status !== "string" || !allowedStatuses.has(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be COMPLETED, CANCELLED, or REFUNDED.",
      });
    }

    const allowedPaymentMethods = new Set(["", "CASH", "CARD", "OTHER"]);

    if (
      typeof paymentMethod !== "string" ||
      !allowedPaymentMethods.has(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be CASH, CARD, or OTHER.",
      });
    }

    const result = await getInStoreSales({
      page,
      limit,
      search,
      status,
      paymentMethod,
      dateFrom,
      dateTo,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get in-store sales history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load in-store sales history.",
    });
  }
}
