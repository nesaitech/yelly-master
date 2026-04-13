import { gatherStats } from "../lib/yelly-lead/stats.js";

const projectDir = process.argv[2] ?? process.cwd();
const stats = gatherStats(projectDir);

console.log("yelly-lead stats");
console.log("================");
console.log(`Project:              ${projectDir}`);
console.log(`YELLY.md lines:       ${stats.yellyMdLines}`);
console.log(`YELLY.md updated:     ${stats.yellyMdLastUpdated ?? "(missing)"}`);
console.log(`ADRs recorded:        ${stats.adrCount}`);
console.log(`Active risks:         ${stats.activeRiskCount}`);
console.log(`Top risk severity:    ${stats.topRiskSeverity ?? "(none)"}`);
console.log(`Estimate history:     ${stats.estimateHistoryCount} entries`);
console.log(
  `Estimate bias:        ${stats.estimateBias === null ? "(insufficient data)" : stats.estimateBias.toFixed(3)}`,
);
