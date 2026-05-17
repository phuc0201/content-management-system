import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useFetchAdminCurrentQuery } from "../services/auth.service";
import {
  clearAuth,
  getAccessToken,
  setAccessToken,
} from "../utils/authHelpers";
import { PATH } from "../constants/path.constant";

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  setToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(getAccessToken() || null);
  const { isError, isSuccess, error } = useFetchAdminCurrentQuery(undefined, {
    skip: !token,
  });

  const [user, setUser] = useState<any>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Hàm setToken phải lưu token vào cookies
  const handleSetToken = (newToken: string | null) => {
    if (newToken) {
      setAccessToken(newToken);
    } else {
      clearAuth();
    }
    setToken(newToken);
    setHasRedirected(false);
  };

  useEffect(() => {
    if (isSuccess && token) {
      setUser(true);
      setHasRedirected(false);
    }
  }, [isSuccess, token]);

  useEffect(() => {
    if (isError && token && !hasRedirected) {
      // Check if error is 401 Unauthorized
      const errorStatus = (error as any)?.status;
      if (errorStatus === 401 || errorStatus === 403) {
        setUser(null);
        clearAuth();
        setToken(null);
        setHasRedirected(true);
        window.location.href = PATH.SIGNIN;
      }
    }
  }, [isError, token, error, hasRedirected]);

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
        setToken: handleSetToken,
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
