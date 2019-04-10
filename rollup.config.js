import { terser } from "rollup-plugin-terser";
import gzipPlugin from 'rollup-plugin-gzip';
const robin=require('./src/rollup/robin.js');
export default {
  input: './dist2/x.html',
  output: {
    dir: './dist1',
    format:'esm'
  },
  plugins:[robin()]
  //plugins: [terser(), gzipPlugin()],
}
