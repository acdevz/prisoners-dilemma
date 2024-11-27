import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import serve from 'rollup-plugin-serve'; // Use rollup-plugin-serve for serving files

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js',
	},
	plugins: [
		svelte({
			compilerOptions: {
				dev: !production, // enable run-time checks when not in production
			},
		}),
		css({ output: 'bundle.css' }), // Extract CSS into separate file
		resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte'],
		}),
		commonjs(),
		// Use rollup-plugin-serve in development
		!production &&
			serve({
				contentBase: 'public',
				host: '0.0.0.0', // Bind to all interfaces
				port: 8080, // Port for the dev server
				open: false, // Do not automatically open the browser
			}),
		// Enable live reload during development
		!production && livereload('public'),
		production && terser(),
	],
	watch: {
		clearScreen: false,
	},
};
