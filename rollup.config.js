// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';

export default [
  // ESM build for modern bundlers
  {
    input: 'src/index.js',
    output: {
      file: 'dist/air-monitor-plots.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      })
    ],
    external: ['highcharts', 'luxon', 'suncalc']
  },

  // UMD build for direct use in <script> tags
  {
    input: 'src/index.js',
    output: {
      file: 'dist/air-monitor-plots.umd.js',
      format: 'umd',
      name: 'AirMonitorPlots',
      globals: {
        highcharts: 'Highcharts',
        luxon: 'luxon',
        suncalc: 'SunCalc'
      },
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      }),
      terser()
    ],
    external: ['highcharts', 'luxon', 'suncalc']
  }
];
