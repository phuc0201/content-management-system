import { Suspense } from "react";
import { createBrowserRouter, type RouteObject } from "react-router-dom";
import RouteTitleSync from "./RouteTitleSync";
import ErrorBoundary from "./guards/ErrorBoundary";
import MainLayout from "../layouts/MainLayout";
import appRoutes, { type AppRouteItem } from "./RouteLazyLoading";
import NotFound from "../pages/NotFound";
import SignIn from "../pages/Auth/SignIn";
import { PATH } from "../constants/path.constant";
import ProtectedRoute from "./guards/ProtectedRoute";

const PageLoader = () => <div>Loading.....</div>;

const RootRouteLayout = () => (
  <>
    <RouteTitleSync />
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  </>
);

type RouteHandle = {
  title: string;
  breadcrumb: AppRouteItem["breadcrumb"] | string;
};

type AppRouteObject = RouteObject & {
  handle?: RouteHandle;
  children?: AppRouteObject[];
};

const mapAppRouteToReactRoute = (route: AppRouteItem): AppRouteObject => {
  const { component: ComponentPage, title, breadcrumb, children, ...rest } = route;

  return {
    ...rest,
    handle: { title, breadcrumb: breadcrumb ?? title },
    element: (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <ComponentPage />
        </Suspense>
      </ErrorBoundary>
    ),
    children: children?.map(mapAppRouteToReactRoute),
  };
};

const adminChildren: AppRouteObject[] = appRoutes.map(mapAppRouteToReactRoute);

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootRouteLayout />,
    children: adminChildren,
  },
  {
    path: PATH.SIGNIN,
    element: (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <SignIn />
        </Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
