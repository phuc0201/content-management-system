import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { PATH } from "../constants/path.constant";
import LandingLayout from "../layouts/LandingLayout";
import SignIn from "../pages/Auth/SignIn";
import NotFound from "../pages/NotFound";
import ErrorBoundary from "./guards/ErrorBoundary";
import { PageLoader, RootRouteLayout } from "./RouteLayouts";
import { appRoutes, type AppRouteItem } from "./RouteLazyLoading";

const renderLazyPage = (Page: LazyExoticComponent<ComponentType>) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Page />
    </Suspense>
  </ErrorBoundary>
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
  const {
    component: ComponentPage,
    title,
    breadcrumb,
    children,
    ...rest
  } = route;

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
    path: PATH.LANDING_HOME,
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: renderLazyPage(lazy(() => import("../pages/Landing/Home"))),
      },
      {
        path: "products",
        element: renderLazyPage(
          lazy(() => import("../pages/Landing/Products")),
        ),
      },
      {
        path: "products/:id",
        element: renderLazyPage(
          lazy(() => import("../pages/Landing/ProductDetail")),
        ),
      },
      {
        path: "manufacturing-process",
        element: renderLazyPage(
          lazy(() => import("../pages/Landing/Manufacturing")),
        ),
      },
      {
        path: "blogs",
        element: renderLazyPage(lazy(() => import("../pages/Landing/Blogs"))),
      },
      {
        path: "blogs/:id",
        element: renderLazyPage(
          lazy(() => import("../pages/Landing/BlogDetail")),
        ),
      },
      {
        path: "contact",
        element: renderLazyPage(lazy(() => import("../pages/Landing/Contact"))),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
