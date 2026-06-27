import { create } from "zustand";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type UserRole = "visitor" | "business_owner" | "admin" | null;

interface AuthState {
  role: UserRole;
  email: string | null;
  adminToken: string | null;
  setAuth: (role: UserRole, email?: string | null, adminToken?: string | null) => void;
  logout: () => void;
}

function readStorage() {
  if (typeof window === "undefined") return { role: null as UserRole, email: null as string | null, adminToken: null as string | null };
  return {
    role: localStorage.getItem("user_role") as UserRole,
    email: localStorage.getItem("user_email"),
    adminToken: localStorage.getItem("admin_token"),
  };
}

export const useAuth = create<AuthState>((set) => {
  const { role, email, adminToken } = readStorage();
  return {
    role,
    email,
    adminToken,
    setAuth: (role, email = null, adminToken = null) => {
      if (typeof window !== "undefined") {
        if (role) localStorage.setItem("user_role", role); else localStorage.removeItem("user_role");
        if (email) localStorage.setItem("user_email", email); else localStorage.removeItem("user_email");
        if (adminToken) localStorage.setItem("admin_token", adminToken); else localStorage.removeItem("admin_token");
      }
      set({ role, email, adminToken });
    },
    logout: () => {
      const { adminToken } = readStorage();
      if (adminToken) {
        fetch(`${BASE}/api/admin/logout`, {
          method: "POST",
          headers: { "x-admin-token": adminToken },
        }).catch(() => {});
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_email");
        localStorage.removeItem("admin_token");
      }
      set({ role: null, email: null, adminToken: null });
    },
  };
});
