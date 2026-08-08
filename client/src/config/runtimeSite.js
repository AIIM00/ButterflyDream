function normalizeHostname(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase().replace(/\.$/, "");
}

function parseHostnameList(value) {
  if (typeof value !== "string") {
    return [];
  }

  return [...new Set(value.split(",").map(normalizeHostname).filter(Boolean))];
}

const isProduction = import.meta.env.PROD;

const currentHostname = normalizeHostname(window.location.hostname);

const publicHostnames = parseHostnameList(
  import.meta.env.VITE_PUBLIC_HOSTNAMES,
);

const adminHostname = normalizeHostname(import.meta.env.VITE_ADMIN_HOSTNAME);

if (isProduction) {
  if (publicHostnames.length === 0) {
    throw new Error(
      "VITE_PUBLIC_HOSTNAMES is required for the production frontend build.",
    );
  }

  if (!adminHostname) {
    throw new Error(
      "VITE_ADMIN_HOSTNAME is required for the production frontend build.",
    );
  }

  if (publicHostnames.includes(adminHostname)) {
    throw new Error(
      "The admin hostname must not also be configured as a public hostname.",
    );
  }
}

function determineRuntimeSite() {
  if (!isProduction) {
    return "development";
  }

  if (currentHostname === adminHostname) {
    return "admin";
  }

  if (publicHostnames.includes(currentHostname)) {
    return "customer";
  }

  return "unknown";
}

const runtimeSite = determineRuntimeSite();

export default runtimeSite;
