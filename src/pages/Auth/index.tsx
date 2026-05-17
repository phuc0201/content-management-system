import React from "react";
import { Navigate } from "react-router-dom";
import LogoDefault from "../../assets/logo_default.png";
import GridShape from "../../components/common/GridShape";
import { config } from "../../config";
import { PATH } from "../../constants/path.constant";
import { SiteConfigType } from "../../constants/siteConfig.constant";
import { useAuth } from "../../providers/AuthProvider";
import { useGetSiteConfigsQuery } from "../../services/siteConfig.service";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data: siteConfigs } = useGetSiteConfigsQuery({});
  const mainLogoRaw = siteConfigs?.data?.find(
    (item) => item.type === SiteConfigType.MainLogo,
  )?.images?.[0]?.url;
  const logoUrl = mainLogoRaw ? `${config.imageBaseUrl}${mainLogoRaw}` : LogoDefault;

  if (isAuthenticated) return <Navigate to={PATH.ABOUT} replace />;

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-100 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <div className="block mb-4">
                <img width={231} height={48} src={logoUrl} alt="Logo" />
              </div>
            </div>
          </div>
        </div>
        {/* <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div> */}
      </div>
    </div>
  );
}
