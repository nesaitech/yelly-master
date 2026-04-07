import type { TemplateContext } from "../../lib/types.js";

export interface ResolverDef {
  placeholder: string;
  resolve: (ctx: TemplateContext) => string;
}
