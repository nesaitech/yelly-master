import { gatherStats } from "../lib/8hour-lead/stats.js";

const projectDir = process.argv[2] ?? process.cwd();
const stats = gatherStats(projectDir);

console.log("8hour-lead stats");
console.log("================");
console.log(`Project:              ${projectDir}`);
console.log(`8HOUR.md lines:       ${stats.eightHourMdLines}`);
console.log(`8HOUR.md updated:     ${stats.eightHourMdLastUpdated ?? "(missing)"}`);
console.log(`ADRs recorded:        ${stats.adrCount}`);
console.log(`Active risks:         ${stats.activeRiskCount}`);
console.log(`Top risk severity:    ${stats.topRiskSeverity ?? "(none)"}`);
console.log(`Estimate history:     ${stats.estimateHistoryCount} entries`);
console.log(
  `Estimate bias:        ${stats.estimateBias === null ? "(insufficient data)" : stats.estimateBias.toFixed(3)}`,
);
