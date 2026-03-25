import { Link, NavLink } from "react-router";
import { DocsIcon, GridIcon, TableIcon } from "../assets/icons";
import { useSidebar } from "../providers/SidebarProvider";
import LogoDefault from "../assets/logo_default.png";
import { PiNewspaperClipping } from "react-icons/pi";
import { PATH } from "../constants/path.constant";
import { IoSettingsOutline } from "react-icons/io5";

const MENU_ITEMS = [
  {
    label: "Cấu hình trang web",
    path: PATH.SITE_CONFIG,
    icon: <IoSettingsOutline />,
  },
  {
    label: "Giới thiệu công ty",
    path: PATH.ABOUT,
    icon: <DocsIcon />,
  },
  {
    label: "Sản phẩm",
    path: PATH.PRODUCT,
    icon: <GridIcon />,
  },
  {
    label: "Bài viết",
    path: PATH.BLOG,
    icon: <PiNewspaperClipping />,
  },
  {
    label: "Component Preview",
    path: PATH.COMPONENT_PREVIEW,
    icon: <TableIcon />,
  },
];

const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();

  return (
    <aside
      className={`fixed select-none mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        <Link to="/" className="m-auto">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden m-auto"
                src={LogoDefault}
                alt="Logo"
                width={100}
                height={40}
              />
              <img
                className="hidden dark:block m-auto"
                src={LogoDefault}
                alt="Logo"
                width={100}
                height={40}
              />
            </>
          ) : (
            <img src={LogoDefault} alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      <nav>
        <ul className="flex flex-col gap-1">
          {MENU_ITEMS.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  (isActive ? "menu-item-active" : "menu-item-inactive") + " menu-item group"
                }
              >
                <span className="menu-item-icon-size">{item.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
