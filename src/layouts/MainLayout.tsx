import { Breadcrumb } from "antd";
import { GoHome } from "react-icons/go";
import { Link, Outlet, useMatches } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../providers/SidebarProvider";
import Header from "./Header";
import Sidebar from "./Sidebar";

type RouteHandle = {
  title?: string;
  breadcrumb?: string | ((ctx: { params: Record<string, string | undefined> }) => string);
};

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const matches = useMatches() as Array<{
    pathname: string;
    params: Record<string, string | undefined>;
    handle?: RouteHandle;
  }>;

  const breadcrumbItems = matches
    .filter((m) => !!m.handle?.breadcrumb)
    .map((m) => {
      const bc = m.handle?.breadcrumb;
      const label = typeof bc === "function" ? bc({ params: m.params }) : bc;
      return { title: <Link to={m.pathname}>{label}</Link> };
    });

  return (
    <div className="min-h-screen xl:flex">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-72.5" : "lg:ml-22.5"} ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header />
        <div className="w-full p-4 mx-auto md:p-6 dark:bg-gray-900 dark:text-gray-100 flex-1">
          <div className="pb-5">
            <Breadcrumb
              items={[
                {
                  href: "",
                  title: <GoHome className="text-xl" />,
                },
                ...breadcrumbItems,
              ]}
            />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default function MainLayout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
