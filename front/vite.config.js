import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    optimizeDeps: {
        exclude: ["oh-vue-icons/icons"],
    },
    server: {
        host: true,
        port: parseInt(process.env.VITE_PORT) || 5173,
        watch: {
            usePolling: true,
        },
    },
});