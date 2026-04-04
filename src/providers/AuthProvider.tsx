import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useFetchAdminCurrentQuery } from "../services/auth.service";
import { clearAuth, getAccessToken } from "../utils/authHelpers";

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getAccessToken() || null);
  const {
    data: adminInfo,
    isError,
    isSuccess,
  } = useFetchAdminCurrentQuery(undefined, {
    skip: !token,
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (isSuccess) setUser(true);
    if (isError || !token) {
      setUser(null);
      clearAuth();
      setToken(null);
    }
  }, [adminInfo, isError, token]);

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!token,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
