import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte(), tsconfigPaths()],
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/main.ts"),
            name: "static/insound",
            fileName: "static/insound",
            formats: ["es"],
        },
        rollupOptions: {
            output: {
                assetFileNames: assetInfo => (assetInfo.name === "style.css") ?
                    "static/style.css" : (assetInfo.name || ""),
            },
            external: ["svelte"],
        },
        outDir: path.resolve(__dirname, "dist"),
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
});
