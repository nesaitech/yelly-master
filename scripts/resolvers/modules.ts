import type { ResolverDef } from "./types.js";

export const modulesRootResolver: ResolverDef = {
  placeholder: "MODULES_ROOT",
  resolve: (ctx) => ctx.modulesRoot,
};

export const binRootResolver: ResolverDef = {
  placeholder: "BIN_ROOT",
  resolve: (ctx) => ctx.binRoot,
};

export const versionResolver: ResolverDef = {
  placeholder: "VERSION",
  resolve: (ctx) => ctx.version,
};
