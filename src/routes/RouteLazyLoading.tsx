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

const BlogPage = lazy(() => import("../pages/Blog"));
const AboutPage = lazy(() => import("../pages/About"));

const appRoutes: AppRouteItem[] = [
  {
    key: PATH.SITE_CONFIG,
    path: PATH.SITE_CONFIG,
    title: "Cấu hình trang web",
    breadcrumb: "Cấu hình trang web",
    component: lazy(() => import("../pages/SiteConfig")),
  },
  {
    key: PATH.ABOUT,
    path: PATH.ABOUT,
    title: "Về chúng tôi",
    breadcrumb: "Về chúng tôi",
    component: AboutPage,
  },
  {
    key: PATH.BLOG,
    path: PATH.BLOG,
    title: "Blog",
    breadcrumb: "Bài viết",
    component: BlogPage,
    children: [
      {
        key: `${PATH.BLOG}-index`,
        path: "",
        title: "Danh sách",
        breadcrumb: "Danh sách",
        component: lazy(() => import("../pages/Blog/Blog")),
      },
      {
        key: `${PATH.BLOG}-edit`,
        path: ":id",
        title: "Chỉnh sửa bài viết",
        breadcrumb: "Chi tiết",
        component: lazy(() => import("../pages/Blog/BlogDetails")),
      },
      {
        key: `${PATH.BLOG}-create`,
        path: "create",
        title: "Tạo mới bài viết",
        breadcrumb: "Tạo mới",
        component: lazy(() => import("../pages/Blog/BlogDetails")),
      },
    ],
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
    key: PATH.CATEGORY,
    path: PATH.CATEGORY,
    title: "Danh mục",
    breadcrumb: "Danh mục",
    component: lazy(() => import("../pages/Categories")),
  },
  {
    key: PATH.COMPONENT_PREVIEW,
    path: PATH.COMPONENT_PREVIEW,
    title: "Component Preview",
    breadcrumb: "Component Preview",
    component: lazy(() => import("../pages/ComponentPreview")),
  },
];

export default appRoutes;
