import { defineConfig } from "rollup"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import terser from "@rollup/plugin-terser"
import json from "@rollup/plugin-json"

const targetDir = "build"

export default () =>
  defineConfig({
    input: "lib/index.js",
    output: {
      format: "es",
      dir: targetDir,
    },
    plugins: [nodeResolve(), json(), commonjs(), terser()],
  })
