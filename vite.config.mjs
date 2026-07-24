import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                frontend: 'resources/js/frontend.js',
            },
            output: {
                entryFileNames: 'js/[name].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
    },
});
