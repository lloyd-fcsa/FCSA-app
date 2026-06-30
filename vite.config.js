import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { membersDevMiddleware } from './api/_dev-members.js'
import { forumDevMiddleware } from './api/_dev-forum.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fcsa-dev-api',
      configureServer(server) {
        membersDevMiddleware(server.middlewares)
        forumDevMiddleware(server.middlewares)
      },
    },
  ],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      "/api/news": {
        target: "https://www.fcsa.org.uk",
        changeOrigin: true,
        rewrite: (p) => {
          const url = new URL(p, "http://localhost");
          const slug = url.searchParams.get("slug");
          const per_page = url.searchParams.get("per_page") || "10";
          const params = new URLSearchParams({ per_page, _embed: "wp:featuredmedia,author,wp:term" });
          if (slug) params.set("slug", slug);
          return "/wp-json/wp/v2/posts?" + params.toString();
        },
      },
      "/api/events": {
        target: "https://www.fcsa.org.uk",
        changeOrigin: true,
        rewrite: (p) => {
          const url = new URL(p, "http://localhost");
          const slug = url.searchParams.get("slug");
          const per_page = url.searchParams.get("per_page") || "20";
          const qp = slug
            ? `slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,author`
            : `per_page=${per_page}&_embed=wp:featuredmedia,author`;
          return "/wp-json/wp/v2/event?" + qp;
        },
      },
    },
  },
})