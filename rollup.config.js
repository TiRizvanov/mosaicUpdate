import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'packages/plot/src/index.js',
    output: [
      {
        file: 'packages/plot/dist/mosaic-plot.js',
        format: 'esm'
      },
      {
        file: 'packages/plot/dist/mosaic-plot.min.js',
        format: 'esm',
        plugins: [terser()]
      }
    ],
    plugins: [nodeResolve(), commonjs()]
  },
  {
    input: 'packages/vgplot/src/index.js',
    output: [
      {
        file: 'packages/vgplot/dist/vgplot.js',
        format: 'esm'
      },
      {
        file: 'packages/vgplot/dist/vgplot.min.js',
        format: 'esm',
        plugins: [terser()]
      }
    ],
    plugins: [nodeResolve(), commonjs()]
  }
];
