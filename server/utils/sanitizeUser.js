function sanitizeUser(user) {
  if (!user || typeof user !== "object" || Array.isArray(user)) {
    throw new TypeError("sanitizeUser requires a valid user object.");
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export default sanitizeUser;
