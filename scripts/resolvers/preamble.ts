import type { ResolverDef } from "./types.js";

export const preambleResolver: ResolverDef = {
  placeholder: "PREAMBLE",
  resolve: (ctx) => {
    return `<!-- yelly-master v${ctx.version} | host: ${ctx.host} -->
<!-- Generated file — do not edit. Edit SKILL.md.tmpl instead. -->

**Before starting any work:**

1. Run update check:
\`\`\`bash
${ctx.binRoot}/yelly-update-check
\`\`\`

2. Detect repo structure:
\`\`\`bash
${ctx.binRoot}/yelly-repo-mode
\`\`\`

3. Load user config:
\`\`\`bash
${ctx.binRoot}/yelly-config get update.notify
\`\`\``;
  },
};
