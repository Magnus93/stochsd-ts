import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/index.ts',
  output: {
    file: './dist/bundle.js',
    format: 'iife', // Immediately Invoked Function Expression
    sourcemap: true,
  },
  plugins: [
    resolve({
      extensions: ['.js', '.ts'], // Handle both .js and .ts files
      browser: true,
      preferBuiltins: false // This ensures that built-in modules are not preferred over user-defined modules
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true, // Ensure source maps are enabled if needed
    })
  ]
};
