import { ConfigProvider, theme as antdTheme } from "antd";
import { RouterProvider } from "react-router-dom";
import { useTheme } from "./providers/ThemeProvider";
import { router } from "./routes/router";

export default function App() {
  const { theme } = useTheme();
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
