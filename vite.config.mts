/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config
export default defineConfig({
    base: '/rmp-gallery/',
    plugins: [
        react(),
        legacy({
            targets: ['defaults', '>0.2%', 'not dead'],
            modernPolyfills: true,
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux', 'react-i18next', 'react-datepicker'],
                    chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion', 'react-icons'],
                },
            },
        },
    },
    server: {
        port: 8000,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        server: {
            deps: {
                fallbackCJS: true,
            },
        },
        setupFiles: './src/setupTests.ts',
        watch: false,
    },
});
