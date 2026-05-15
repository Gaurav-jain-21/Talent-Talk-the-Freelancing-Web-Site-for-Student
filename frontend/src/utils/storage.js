export const AUTH_KEYS = ["token", "role", "userId", "name", "email", "imageUrl"];

export function getStoredUser() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");
  const imageUrl = localStorage.getItem("imageUrl");

  if (!token || !role || !userId) return null;
  return { token, role, userId, name: name || "Talent", email: email || "", imageUrl: imageUrl || "" };
}

export function persistAuth(payload) {
  const auth = {
    token: payload?.token,
    role: payload?.role,
    userId: payload?.userId,
    name: payload?.name,
    email: payload?.email,
    imageUrl: payload?.imageUrl,
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
