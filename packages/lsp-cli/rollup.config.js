import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';

export default [
  {
    input: './src/cli.ts',
    plugins: [
      nodeResolve({
        exportConditions: ['node'],
      }),
      commonjs(),
      esbuild(),
    ],
    output: [
      {
        file: './dist/cli.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
  },
];
