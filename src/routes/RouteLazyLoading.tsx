import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { PATH } from "../constants/path.constant";

export type BreadcrumbValue =
  | string
  | ((ctx: { params: Record<string, string | undefined> }) => string);

export interface AppRouteItem {
  key: string;
  path: string;
  title: string;
  breadcrumb?: BreadcrumbValue;
  component: LazyExoticComponent<ComponentType>;
  children?: AppRouteItem[];
}

export const appRoutes: AppRouteItem[] = [
  {
    key: PATH.SITE_CONFIG,
    path: PATH.SITE_CONFIG,
    title: "Cấu hình trang web",
    breadcrumb: "Cấu hình trang web",
    component: lazy(() => import("../pages/SiteConfig")),
  },
  {
    key: PATH.CATEGORY,
    path: PATH.CATEGORY,
    title: "Danh mục sản phẩm",
    breadcrumb: "Danh mục sản phẩm",
    component: lazy(() => import("../pages/Categories")),
  },
  {
    key: PATH.ABOUT,
    path: PATH.ABOUT,
    title: "Về chúng tôi",
    breadcrumb: "Về chúng tôi",
    component: lazy(() => import("../pages/About")),
  },
  {
    key: PATH.BLOG,
    path: PATH.BLOG,
    title: "Blog",
    breadcrumb: "Blog",
    component: lazy(() => import("../pages/Blog")),
  },
  {
    key: PATH.MANU_PROCESS,
    path: PATH.MANU_PROCESS,
    title: "Quy trình sản xuất",
    breadcrumb: "Quy trình sản xuất",
    component: lazy(() => import("../pages/ManufacturingProcess")),
  },
  {
    key: PATH.POLICY,
    path: PATH.POLICY,
    title: "Policies & partnerships",
    breadcrumb: "Policies & partnerships",
    component: lazy(() => import("../pages/Policies")),
  },
  {
    key: PATH.PARTNER_REQUESTS,
    path: PATH.PARTNER_REQUESTS,
    title: "Đăng ký đối tác",
    breadcrumb: "Đăng ký đối tác",
    component: lazy(() => import("../pages/PartnerRequests")),
  },
  {
    key: PATH.PRODUCT,
    path: PATH.PRODUCT,
    title: "Sản phẩm",
    breadcrumb: "Sản phẩm",
    component: lazy(() => import("../pages/Products")),
    children: [
      {
        key: `${PATH.PRODUCT}-index`,
        path: "",
        title: "Danh sách",
        breadcrumb: "Danh sách",
        component: lazy(() => import("../pages/Products/Products")),
      },
      {
        key: `${PATH.PRODUCT}-edit`,
        path: ":id",
        title: "Chỉnh sửa sản phẩm",
        breadcrumb: "Chi tiết",
        component: lazy(() => import("../pages/Products/ProductDetails")),
      },
      {
        key: `${PATH.PRODUCT}-create`,
        path: "create",
        title: "Tạo mới sản phẩm",
        breadcrumb: "Tạo mới",
        component: lazy(() => import("../pages/Products/ProductDetails")),
      },
    ],
  },
  {
    key: PATH.COMPONENT_PREVIEW,
    path: PATH.COMPONENT_PREVIEW,
    title: "Component Preview",
    breadcrumb: "Component Preview",
    component: lazy(() => import("../pages/ComponentPreview")),
  },
];
