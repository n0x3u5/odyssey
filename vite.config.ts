import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [wasm(), enhancedImages(), sveltekit()],
	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext'
		},
		exclude: ['@viz/datamodel']
	},
	build: {
		target: 'esnext'
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
