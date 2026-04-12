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
const SiteConfigPage = lazy(() => import("../pages/SiteConfig"));
const ProductsPage = lazy(() => import("../pages/Products"));
const BlogListPage = lazy(() => import("../pages/Blog/Blog"));
const BlogDetailsPage = lazy(() => import("../pages/Blog/BlogDetails"));
const ProductsListPage = lazy(() => import("../pages/Products/Products"));
const ProductDetailsPage = lazy(() => import("../pages/Products/ProductDetails"));
const CategoriesPage = lazy(() => import("../pages/Categories"));
const ComponentPreviewPage = lazy(() => import("../pages/ComponentPreview"));
const ManufacturingProcessPage = lazy(() => import("../pages/ManufacturingProcess"));
const PoliciesPage = lazy(() => import("../pages/Policies"));
const PoliciesListPage = lazy(() => import("../pages/Policies/Policies"));
const PolicyDetailsPage = lazy(() => import("../pages/Policies/PolicyDetails"));
const ContactPage = lazy(() => import("../pages/Contact"));

const appRoutes: AppRouteItem[] = [
  {
    key: PATH.SITE_CONFIG,
    path: PATH.SITE_CONFIG,
    title: "Cấu hình trang web",
    breadcrumb: "Cấu hình trang web",
    component: SiteConfigPage,
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
        component: BlogListPage,
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
    component: ProductsPage,
    children: [
      {
        key: `${PATH.PRODUCT}-index`,
        path: "",
        title: "Danh sách",
        breadcrumb: "Danh sách",
        component: ProductsListPage,
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
    component: ManufacturingProcessPage,
  },
  {
    key: PATH.POLICY,
    path: PATH.POLICY,
    title: "Chính sách",
    breadcrumb: "Chính sách",
    component: PoliciesPage,
    children: [
      {
        key: `${PATH.POLICY}-index`,
        path: "",
        title: "Danh sách",
        breadcrumb: "Danh sách",
        component: PoliciesListPage,
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
    component: ContactPage,
  },
];

export default appRoutes;
