import { ConfigProvider, theme as antdTheme } from "antd";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import LogoDefault from "./assets/logo_default.png";
import { config } from "./config";
import { SiteConfigType } from "./constants/siteConfig.constant";
import { useTheme } from "./providers/ThemeProvider";
import { router } from "./routes/router";
import { useGetSiteConfigsQuery } from "./services/siteConfig.service";
import { getAccessToken } from "./utils/authHelpers";

export default function App() {
  const { theme } = useTheme();
  const hasToken = !!getAccessToken();

  // Skip query khi chưa có token để tránh loop reload sau logout
  const { data: siteConfigs } = useGetSiteConfigsQuery({}, { skip: !hasToken });

  const faviconRaw = siteConfigs?.data?.find((item) => item.type === SiteConfigType.Favicon)?.images?.[0]?.url;
  const faviconUrl = faviconRaw ? `${config.imageBaseUrl}${faviconRaw}` : LogoDefault;

  function setFavicon(url?: string) {
    const id = "app-favicon";
    let link = document.getElementById(`favicon`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "icon";
      document.head.appendChild(link);
    }
    const fallback = "/favicon.svg";
    if (!url) link.href = fallback;
    else link.href = `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
  }

  useEffect(() => {
    (async () => {
      try {
        setFavicon(faviconUrl);
      } catch (error) {
        console.error("Failed to set favicon:", error);
        setFavicon();
      }
    })();
  }, [faviconUrl]);

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#465fff" },
        components: {
          Button: {
            defaultBorderColor: "#d0d5dd",
            defaultColor: "#344054",
            defaultHoverColor: "#1d2939",
            defaultHoverBorderColor: "#98a2b3",
          },
        },
        algorithm: theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
