const DASHBOARD_PERIODS = new Set(["7d", "30d", "90d", "all"]);

export class AdminDashboardValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminDashboardValidationError";
    this.statusCode = 400;
  }
}

export function parseAdminDashboardQuery(query) {
  const period =
    typeof query.period === "string"
      ? query.period.trim().toLowerCase()
      : "30d";

  if (!DASHBOARD_PERIODS.has(period)) {
    throw new AdminDashboardValidationError(
      "Dashboard period must be 7d, 30d, 90d, or all.",
    );
  }

  return {
    period,
  };
}
