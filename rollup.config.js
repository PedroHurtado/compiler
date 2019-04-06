import { terser } from "rollup-plugin-terser";
import gzipPlugin from 'rollup-plugin-gzip';
export default {
  input: './src/di/foo.js',
  output: {
    dir: './dist1',
    format:'esm'
  },
  //plugins: [terser(), gzipPlugin()],
}
