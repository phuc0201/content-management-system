import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { PATH } from "../../constants/path.constant";
import { useAuth } from "../../providers/AuthProvider";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={PATH.SIGNIN} replace />;
  }

  return children;
}
