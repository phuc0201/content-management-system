import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import ManuProcessStepList from "../components/manuProcess/ManuProcessStepList";
import { PATH } from "../constants/path.constant";
import AboutPage from "../pages/About";
import BlogLayout from "../pages/Blog";
import BlogList from "../pages/Blog/Blog";
import Contact from "../pages/Contact";
import PolicyLayout from "../pages/Policies";
import Policies from "../pages/Policies/Policies";
import ProductsLayout from "../pages/Products";
import Products from "../pages/Products/Products";
import SiteConfig from "../pages/SiteConfig";

export type BreadcrumbValue =
  | string
  | ((ctx: { params: Record<string, string | undefined> }) => string);

export interface AppRouteItem {
  key: string;
  path: string;
  title: string;
  breadcrumb?: BreadcrumbValue;
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  keepAlive?: boolean;
  children?: AppRouteItem[];
}

const BlogDetailsPage = lazy(() => import("../pages/Blog/BlogDetails"));
const ProductDetailsPage = lazy(() => import("../pages/Products/ProductDetails"));
const CategoriesPage = lazy(() => import("../pages/Categories"));
const ComponentPreviewPage = lazy(() => import("../pages/ComponentPreview"));
const PolicyDetailsPage = lazy(() => import("../pages/Policies/PolicyDetails"));

const appRoutes: AppRouteItem[] = [
  {
    key: PATH.SITE_CONFIG,
    path: PATH.SITE_CONFIG,
    title: "Cấu hình trang web",
    breadcrumb: "Cấu hình trang web",
    keepAlive: true,
    component: SiteConfig,
  },
  {
    key: PATH.ABOUT,
    path: PATH.ABOUT,
    title: "Về chúng tôi",
    breadcrumb: "Về chúng tôi",
    keepAlive: true,
    component: AboutPage,
  },
  {
    key: PATH.BLOG,
    path: PATH.BLOG,
    title: "Blog",
    breadcrumb: "Bài viết",
    component: BlogLayout,
    children: [
      {
        key: `${PATH.BLOG}-index`,
        path: "",
        title: "Danh sách",
        breadcrumb: "Danh sách",
        keepAlive: true,
        component: BlogList,
      },
      {
        key: `${PATH.BLOG}-edit`,
        path: ":id",
        title: "Chỉnh sửa bài viết",
        breadcrumb: "Chi tiết",
        component: BlogDetailsPage,
      },
      {
        key: `${PATH.BLOG}-create`,
        path: "create",
        title: "Tạo mới bài viết",
        breadcrumb: "Tạo mới",
        component: BlogDetailsPage,
      },
    ],
  },
  {
    key: PATH.PRODUCT,
    path: PATH.PRODUCT,
    title: "Sản phẩm",
    breadcrumb: "Sản phẩm",
    component: ProductsLayout,
    children: [
      {
        key: `${PATH.PRODUCT}-index`,
        path: "",
        title: "Danh sách",
        breadcrumb: "Danh sách",
        component: Products,
        keepAlive: true,
      },
      {
        key: `${PATH.PRODUCT}-edit`,
        path: ":id",
        title: "Chỉnh sửa sản phẩm",
        breadcrumb: "Chi tiết",
        component: ProductDetailsPage,
      },
      {
        key: `${PATH.PRODUCT}-create`,
        path: "create",
        title: "Tạo mới sản phẩm",
        breadcrumb: "Tạo mới",
        component: ProductDetailsPage,
      },
    ],
  },
  {
    key: PATH.CATEGORY,
    path: PATH.CATEGORY,
    title: "Danh mục",
    breadcrumb: "Danh mục",
    component: CategoriesPage,
  },
  {
    key: PATH.COMPONENT_PREVIEW,
    path: PATH.COMPONENT_PREVIEW,
    title: "Component Preview",
    breadcrumb: "Component Preview",
    component: ComponentPreviewPage,
  },
  {
    key: PATH.MANU_PROCESS,
    path: PATH.MANU_PROCESS,
    title: "Quy trình sản xuất",
    breadcrumb: "Quy trình sản xuất",
    keepAlive: true,
    component: ManuProcessStepList,
  },
  {
    key: PATH.POLICY,
    path: PATH.POLICY,
    title: "Chính sách",
    breadcrumb: "Chính sách",
    component: PolicyLayout,
    children: [
      {
        key: `${PATH.POLICY}-index`,
        path: "",
        title: "Danh sách",
        breadcrumb: "Danh sách",
        keepAlive: true,
        component: Policies,
      },
      {
        key: `${PATH.POLICY}-details`,
        path: ":id",
        title: "Chi tiết chính sách",
        breadcrumb: "Chi tiết",
        component: PolicyDetailsPage,
      },
    ],
  },
  {
    key: PATH.CONTACT,
    path: PATH.CONTACT,
    title: "Liên hệ",
    breadcrumb: "Liên hệ",
    keepAlive: true,
    component: Contact,
  },
];

export default appRoutes;
