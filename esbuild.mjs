import {build} from "esbuild";
import { aliasPath } from 'esbuild-plugin-alias-path'
import tsconfig from "./tsconfig.json" assert { type: 'json' };

const aliasObj = Object.keys(tsconfig.compilerOptions.paths).reduce(
  (obj, key) => {
    if (key.endsWith("/*")) {
      return obj;
    }
    return {
      ...obj,
      [key]: tsconfig.compilerOptions.paths[key],
    };
  },
  {}
);

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.cjs",
  platform: "node",
  bundle: true,
  minify: true,
  logLevel: "info",
  plugins: [
    aliasPath(aliasObj)
  ],
});
