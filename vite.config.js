import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { creativeApiPlugin } from "./server/viteApiPlugin";
export default defineConfig({
    plugins: [react(), creativeApiPlugin()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
});
