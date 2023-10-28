import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import fs from "fs";

const isP = process.env.NODE_ENV === "production";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte(), tsconfigPaths(), {
        name: "dist-cleanup",
        closeBundle: isP ? async () => {
            // Remove hash from assets
            const dir = path.resolve(__dirname, "dist/assets");
            const newDir = path.resolve(__dirname, "dist/static")
            const files = fs.readdirSync(dir);
            files.forEach((file: string) => {
              // Remove hash from file name
              const newFile = file.replace(/-[a-z0-9]{8}\./, '.');
              fs.renameSync(path.resolve(dir, file), path.resolve(newDir, newFile));
            });
          }
        : undefined,
        },
    ],
    build: {
        rollupOptions: {
            output: {
                assetFileNames: assetInfo => {
                    if (assetInfo.name == "main.css") {
                        return "static/main.css";
                    }

                    return assetInfo.name || "";
                },

            },
            input: "src/main.ts"
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
