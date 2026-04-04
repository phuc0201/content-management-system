import { ConfigProvider, theme as antdTheme } from "antd";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import LogoDefault from "./assets/logo_default.png";
import { useTheme } from "./providers/ThemeProvider";
import { router } from "./routes/router";

export default function App() {
  const { theme } = useTheme();

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
        setFavicon(LogoDefault);
      } catch (error) {
        console.error("Failed to set favicon:", error);
        setFavicon();
      }
    })();
  }, []);

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
