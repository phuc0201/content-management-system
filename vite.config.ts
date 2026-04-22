import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["react-activation/babel"],
      },
    }),
    tailwindcss(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // CKEditor — check trước nhất
          const ckPkg = id.match(/[\\/]node_modules[\\/]@ckeditor[\\/]([^\\/]+)/);
          if (ckPkg) return `vendor-ckeditor5-${ckPkg[1]}`;
          if (id.includes("ckeditor5")) return "vendor-editor-core";

          // Leaflet
          if (
            id.includes("leaflet") ||
            id.includes("react-leaflet") ||
            id.includes("@react-leaflet")
          )
            return "vendor-leaflet";

          // es-toolkit
          if (id.includes("es-toolkit")) return "vendor-es-toolkit";

          // Markdown ecosystem — gộp tất cả vào 1 chunk
          if (
            id.includes("unified") ||
            id.includes("/remark") ||
            id.includes("/rehype") ||
            id.includes("micromark") ||
            id.includes("mdast") ||
            id.includes("hast") ||
            id.includes("/unist") ||
            id.includes("vfile") ||
            id.includes("zwitch") ||
            id.includes("bail") ||
            id.includes("trough") ||
            id.includes("trim-lines") ||
            id.includes("property-information") ||
            id.includes("web-namespaces") ||
            id.includes("comma-separated-tokens") ||
            id.includes("space-separated-tokens")
          )
            return "vendor-markdown";

          // Gộp react + redux + react-redux vào 1 chunk để tránh circular
          if (
            id.includes("/react/") ||
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("scheduler") ||
            id.includes("@reduxjs/toolkit") ||
            id.includes("react-redux") ||
            id.includes("immer") ||
            id.includes("reselect")
          )
            return "vendor-react-redux";

          // Gộp antd + icons + rc-component vào 1 chunk để tránh circular
          if (
            id.includes("antd/") ||
            id.includes("@ant-design") ||
            id.includes("/rc-") ||
            id.includes("@rc-component")
          )
            return "vendor-antd";

          // Utils
          if (id.includes("axios") || id.includes("dayjs") || id.includes("react-toastify"))
            return "vendor-utils";
        },
      },
    },
  },
});
