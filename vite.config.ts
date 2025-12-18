import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

// Permite desactivar la generación de tipos Wayfinder en entornos donde no queremos ejecutar "php artisan" (por ejemplo, build de Docker)
const enableWayfinder =
    process.env.BUILD_WAYFINDER_TYPES !== '0' &&
    process.env.BUILD_WAYFINDER_TYPES !== 'false';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        // Solo añadimos wayfinder si no está deshabilitado por variable de entorno
        ...(enableWayfinder
            ? [
                  wayfinder({
                      formVariants: true,
                  }),
              ]
            : []),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});

// NOTA IMPORTANTE:
//  La carpeta resources/js/routes es generada automáticamente por Wayfinder.
//  No coloques helpers custom ahí (p.ej. adminPath). Usa en su lugar archivos estables en resources/js/lib.
//  Helper actual de rutas admin: resources/js/lib/admin-routes.ts
