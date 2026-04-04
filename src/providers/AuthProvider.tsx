import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useFetchAdminCurrentQuery } from "../services/auth.service";
import {
  clearAuth,
  getAccessToken,
  setAccessToken,
} from "../utils/authHelpers";

type AuthContextType = {
  user: unknown;
  isAuthenticated: boolean;
  logout: () => void;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(
    getAccessToken() || null,
  );
  const {
    data: adminInfo,
    isError,
    isSuccess,
  } = useFetchAdminCurrentQuery(undefined, {
    skip: !token,
  });

  const user = useMemo(
    () => (isSuccess ? (adminInfo ?? true) : null),
    [adminInfo, isSuccess],
  );

  const setToken = (nextToken: string | null) => {
    if (!nextToken) {
      clearAuth();
      setTokenState(null);
      return;
    }
    setAccessToken(nextToken);
    setTokenState(nextToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(token) && !isError,
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
