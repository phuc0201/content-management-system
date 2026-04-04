import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./guards/ProtectedRoute";
import RouteTitleSync from "./RouteTitleSync";

export function PageLoader() {
  return <div>Loading.....</div>;
}

export function RootRouteLayout() {
  return (
    <>
      <RouteTitleSync />
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    </>
  );
}
