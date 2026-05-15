/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/services";
import { clearAuth, getStoredUser, persistAuth } from "../utils/storage";
import { routeForRole } from "../utils/format";

const AuthContext = createContext(null);

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
      applyOAuth(payload) {
        const nextUser = persistAuth(payload);
        setUser(nextUser);
        navigate(routeForRole(nextUser?.role), { replace: true });
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

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
