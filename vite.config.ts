import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import fs from "fs";

const isP = process.env.NODE_ENV === "production";
console.log("Vite is Production:", isP);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte(), tsconfigPaths(), {
        name: "dist-cleanup",
        closeBundle: isP ? () => {
            // Remove hash from assets
            const dir = path.resolve(__dirname, "dist/assets");
            const newDir = path.resolve(__dirname, "dist/static");
            const files = fs.readdirSync(dir);
            files.forEach((file: string) => {
              // Remove hash from file name
              const newFile = file.replace(/-[a-z0-9]{8}\./, '.');
              console.log("Move file: " + dir + "/" + file + " => " + newDir + "/" + newFile);
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
        headers: {
            "content-security-policy": "base-uri 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'self'; img-src 'self'; object-src 'none'; script-src 'self' 'wasm-unsafe-eval' blob:; style-src 'self' 'unsafe-inline'",
            "cross-origin-embedder-policy": "require-corp",
            "cross-origin-opener-policy": "same-site",
            "cross-origin-resource-policy": "same-site",
            "cross-agent-cluster": "?1",
            "referrer-policy": "no-referrer",
            "x-content-type-options": "no-sniff",
            "x-dns-prefetch-control": "off",
            "x-download-options": "noopen",
            "x-frame-options": "SAMEORIGIN",
            "x-permitted-cross-domain-policies": "none",
            "x-xss-protection": "0",
            "Access-Control-Allow-Origin": "http://localhost:5173",
        }
    },
});
