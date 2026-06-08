import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // permite acesso pela rede local (LAN) durante o dev
        port: 5173
    }
});
