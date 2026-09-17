import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        const parsedUrl = new URL(req.url, 'http://localhost:3000');
        const pathname = parsedUrl.pathname;

        const ROUTE_MAP = {
          '/api/verify-id': './api/id-cards.js',
          '/api/id-cards': './api/id-cards.js',
          '/api/royal-audiences': './api/royal-audiences.js',
          '/api/marketplace': './api/marketplace.js',
          '/api/land-registry': './api/land-registry.js',
          '/api/donations': './api/donations.js',
          '/api/paystack-verify': './api/donations.js',
          '/api/paystack-webhook': './api/donations.js',
          '/api/donation-stats': './api/donations.js',
          '/api/security': './api/security.js',
          '/api/incidents': './api/security.js',
          '/api/cctv': './api/security.js',
          '/api/escort': './api/security.js',
          '/api/live-location': './api/security.js',
          '/api/patrol-checkin': './api/security.js',
          '/api/whistleblower': './api/security.js',
          '/api/broadcasts': './api/security.js',
          '/api/community': './api/community.js',
          '/api/forum': './api/community.js',
          '/api/scholarships': './api/community.js',
          '/api/contacts': './api/community.js',
          '/api/sync': './api/community.js',
          '/api/push-tokens': './api/community.js',
          '/api/auth': './api/auth.js',
          '/api/admin-actions': './api/admin-actions.js',
          '/api/admin-officers': './api/admin-officers.js',
          '/api/health': './api/health.js',
          '/api/geocode': './api/geocode.js',
        };

        const targetFile = ROUTE_MAP[pathname] || `./api/${pathname.replace('/api/', '')}.js`;
        const absPath = path.resolve(__dirname, targetFile);

        try {
          // Read request body if present
          let body = {};
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const raw = Buffer.concat(chunks).toString('utf8');
            if (raw) {
              try {
                body = JSON.parse(raw);
              } catch {
                body = {};
              }
            }
          }

          // Augment req
          req.query = Object.fromEntries(parsedUrl.searchParams.entries());
          req.body = body;

          // Augment res
          res.status = function (code) {
            res.statusCode = code;
            return res;
          };
          res.json = function (data) {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'application/json');
            }
            res.end(JSON.stringify(data));
            return res;
          };

          const mod = await import(`${absPath}?t=${Date.now()}`);
          if (typeof mod.default === 'function') {
            await mod.default(req, res);
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `API route ${pathname} not found.` }));
          }
        } catch (err) {
          console.error(`[Vite Dev API Error] ${pathname}:`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-core': ['react', 'react-dom', 'react-router-dom'],
          'vendor-puck': ['@measured/puck'],
        },
      },
    },
  },
});
