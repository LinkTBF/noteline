import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

module.exports = defineConfig({
	plugins: [
		vue({ customElement: true })
	],
	build: {
		lib: {
			entry: './src/webview/index.ts',
			formats: ['es', 'cjs'],
			fileName: (format) => `index.${format}.js`
		},
		emptyOutDir: false,
		outDir: 'build/ts/compiled'
	},
	server: {
		port: 3030
	}
})
