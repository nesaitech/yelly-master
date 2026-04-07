import type { ResolverDef } from "./types.js";
import type { TemplateContext } from "../../lib/types.js";
import { preambleResolver } from "./preamble.js";
import { modulesRootResolver, binRootResolver, versionResolver } from "./modules.js";

export const ALL_RESOLVERS: ResolverDef[] = [
  preambleResolver,
  modulesRootResolver,
  binRootResolver,
  versionResolver,
];

export function resolveTemplate(template: string, resolvers: ResolverDef[], ctx: TemplateContext): string {
  let result = template;
  for (const resolver of resolvers) {
    const pattern = `{{${resolver.placeholder}}}`;
    if (result.includes(pattern)) {
      result = result.replaceAll(pattern, resolver.resolve(ctx));
    }
  }
  return result;
}
