import { Link, Outlet } from "react-router-dom";
import { PATH } from "../constants/path.constant";

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to={PATH.LANDING_HOME} className="font-semibold text-lg">
            MediBioTech
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to={PATH.LANDING_PRODUCTS}>Sản phẩm</Link>
            <Link to={PATH.LANDING_MANU_PROCESS}>Sản xuất</Link>
            <Link to={PATH.LANDING_BLOGS}>Tin tức</Link>
            <Link to={PATH.LANDING_CONTACT}>Liên hệ</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
