import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // O código do Lovable importa por "@/..." — o alias precisa existir aqui
    // e no tsconfig, senão o editor reclama e o build quebra.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
