import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: false,
        sourcemap: false,
        cssCodeSplit: false,
        minify: true,
        // Contract: output names must match AssetsManager (dist/js/editor.js, dist/css/editor.css).
        esbuild: {
            drop: ['console', 'debugger'],
        },
        rollupOptions: {
            input: {
                editor: 'resources/js/editor.js',
            },
            output: {
                format: 'iife',
                name: 'EmjeMotionEditor',
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/chunks/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const name = assetInfo.name ?? '';
                    const extension = name.split('.').pop() ?? '';
                    if (extension === 'css') {
                        return 'css/editor.[ext]';
                    }
                    return 'assets/[name].[ext]';
                },
            },
        },
    },
});
