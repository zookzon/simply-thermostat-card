import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/simply-thermostat-card.js",
  output: {
    file: "dist/simply-thermostat-card.js",
    format: "es",
  },
  plugins: [resolve(), terser()],
};