import { useEffect, useRef, useState } from "react";
import { AiOutlineInbox, AiOutlineProduct } from "react-icons/ai";
import { GoWorkflow } from "react-icons/go";
import { IoIosLogOut } from "react-icons/io";
import { IoDocumentTextOutline, IoSettingsOutline } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { PiNewspaperClipping } from "react-icons/pi";
import { SlDocs } from "react-icons/sl";
import { Link, NavLink } from "react-router";
import LogoDefault from "../assets/logo_default.png";
import { config } from "../config";
import { PATH } from "../constants/path.constant";
import { SiteConfigType } from "../constants/siteConfig.constant";
import { useAuth } from "../providers/AuthProvider";
import { useSidebar } from "../providers/SidebarProvider";
import { useGetSiteConfigsQuery } from "../services/siteConfig.service";

const MENU_ITEMS = [
  {
    label: "Giới thiệu công ty",
    path: PATH.ABOUT,
    icon: <SlDocs />,
  },
  {
    label: "Thông tin liên hệ",
    path: PATH.CONTACT,
    icon: <MdOutlineMail />,
  },
  {
    label: "Danh mục sản phẩm",
    path: PATH.CATEGORY,
    icon: <AiOutlineInbox />,
  },
  {
    label: "Sản phẩm",
    path: PATH.PRODUCT,
    icon: <AiOutlineProduct />,
  },
  {
    label: "Tin tức",
    path: PATH.BLOG,
    icon: <PiNewspaperClipping />,
  },
  {
    label: "Quy trình sản xuất",
    path: PATH.MANU_PROCESS,
    icon: <GoWorkflow />,
  },
  {
    label: "Chính sách",
    path: PATH.POLICY,
    icon: <IoDocumentTextOutline />,
  },
  {
    label: "Cấu hình trang web",
    path: PATH.SITE_CONFIG,
    icon: <IoSettingsOutline />,
  },
];

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { isExpanded, isMobileOpen, isHovered, closeSidebar } = useSidebar();
  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;
  const sidebarRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(74); // default 74px

  const { data: siteConfigs } = useGetSiteConfigsQuery({});
  const mainLogoRaw = siteConfigs?.data?.find((item) => item.type === SiteConfigType.MainLogo)?.images?.[0]?.url;
  const subLogoRaw = siteConfigs?.data?.find((item) => item.type === SiteConfigType.SubLogo)?.images?.[0]?.url;
  const mainLogoUrl = mainLogoRaw ? `${config.imageBaseUrl}${mainLogoRaw}` : LogoDefault;
  const subLogoUrl = subLogoRaw ? `${config.imageBaseUrl}${subLogoRaw}` : LogoDefault;

  // Đo chiều cao header thực tế
  useEffect(() => {
    const header = document.getElementById("app-header");
    if (!header) return;

    const updateHeight = () => {
      setHeaderHeight(header.offsetHeight);
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(header);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-sidebar-toggle]")) return;
      if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen, closeSidebar]);

  return (
    <aside
      ref={sidebarRef}
      style={{ top: window.innerWidth < 1024 ? `${headerHeight}px` : 0 }}
      className={`fixed select-none flex flex-col px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out md:z-1000 z-100000 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link to="/" className="m-auto">
          {isExpanded || isHovered || isMobileOpen ? (
            <img
              className="m-auto object-contain"
              src={mainLogoUrl}
              alt="Logo"
              width={100}
              height={40}
            />
          ) : (
            <img src={subLogoUrl} alt="Logo" width={32} height={32} className="object-contain" />
          )}
        </Link>
      </div>

      <nav>
        <ul className="flex flex-col gap-1">
          {MENU_ITEMS.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                onClick={() => isMobileOpen && closeSidebar()}
                className={({ isActive }) =>
                  (isActive ? "menu-item-active" : "menu-item-inactive") + " menu-item group"
                }
              >
                <span className="menu-item-icon-size">{item.icon}</span>
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                    isSidebarOpen
                      ? "max-w-60 opacity-100 translate-x-0"
                      : "max-w-0 opacity-0 -translate-x-2"
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}

          <li>
            <button
              className="menu-item-inactive menu-item group w-full"
              onClick={() => {
                logout();
              }}
            >
              <span className="menu-item-icon-size">
                <IoIosLogOut />
              </span>
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                  isSidebarOpen
                    ? "max-w-60 opacity-100 translate-x-0"
                    : "max-w-0 opacity-0 -translate-x-2"
                }`}
              >
                Đăng xuất
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
