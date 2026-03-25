import { Navigate } from "react-router-dom";
import { PATH } from "../../constants/path.constant";
import { useAuth } from "../../providers/AuthProvider";

export default function ProtectedRoute({ children }: any) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={PATH.SIGNIN} replace />;
  }

  return children;
}
