import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/services";
import { clearAuth, getStoredUser, persistAuth } from "../utils/storage";
import { routeForRole } from "../utils/format";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const navigate = useNavigate();

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      toast.error("Session expired. Please sign in again.");
      navigate("/login", { replace: true });
    };

    window.addEventListener("talenttalk:unauthorized", onUnauthorized);
    return () => window.removeEventListener("talenttalk:unauthorized", onUnauthorized);
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token),
      async login(credentials) {
        const payload = await authApi.login(credentials);
        const nextUser = persistAuth({ ...payload, email: credentials.email });
        setUser(nextUser);
        toast.success("Welcome back to Talent Talk");
        navigate(routeForRole(nextUser?.role), { replace: true });
      },
      async applyOAuth(payload) {
        const validated = await authApi.validate(payload?.token);
        const nextUser = persistAuth(payload);
        const normalizedUser = {
          ...nextUser,
          role: validated?.role || nextUser?.role,
          userId: validated?.userId || nextUser?.userId,
          email: validated?.email || nextUser?.email,
        };
        persistAuth(normalizedUser);
        setUser(normalizedUser);
        toast.success("Signed in with Google");
        navigate(routeForRole(normalizedUser?.role), { replace: true });
      },
      logout() {
        clearAuth();
        setUser(null);
        navigate("/login", { replace: true });
      },
      refreshUser() {
        setUser(getStoredUser());
      },
    }),
    [navigate, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
