import { terser } from "rollup-plugin-terser";
import gzipPlugin from 'rollup-plugin-gzip';
export default {
  input: './v2/x.js',
  output: {
    dir: './dist1',
    format:'esm'
  },
  plugins: [terser(), gzipPlugin()],
}