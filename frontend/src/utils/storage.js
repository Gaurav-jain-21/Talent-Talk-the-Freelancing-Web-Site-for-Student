export const AUTH_KEYS = ["token", "role", "userId", "name", "email"];

export function getStoredUser() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");

  if (!token || !role || !userId) return null;
  return { token, role, userId, name: name || "Talent", email: email || "" };
}

export function persistAuth(payload) {
  const auth = {
    token: payload?.token,
    role: payload?.role,
    userId: payload?.userId,
    name: payload?.name,
    email: payload?.email,
  };

  Object.entries(auth).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, String(value));
    }
  });

  return getStoredUser();
}

export function clearAuth() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}
