import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: false,
        sourcemap: false,

        cssCodeSplit: false,

        rollupOptions: {
            input: {
                frontend: 'resources/js/frontend.js',
            },

            output: {
                format: 'iife',
                name: 'EmjeMotion',

                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/chunks/[name]-[hash].js',

                assetFileNames: (assetInfo) => {
                    const extension = assetInfo.name.split('.').pop();

                    if (extension === 'css') {
                        return 'css/frontend.[ext]';
                    }

                    if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(extension)) {
                        return 'images/[name].[ext]';
                    }

                    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) {
                        return 'fonts/[name].[ext]';
                    }

                    return 'assets/[name].[ext]';
                },
            },
        },
    },
});
