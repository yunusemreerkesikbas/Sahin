import "dotenv/config";

import { logger } from "../logger.js";

// Phase 1.3: same flow as setup-armut for Upwork.

async function main(): Promise<void> {
  logger.info("setup-upwork placeholder — implementation lands in Phase 1.3");
  logger.info(
    "Will: launch headed browser → navigate to Upwork → wait for manual login → save data/auth/upwork-state.json",
  );
}

main().catch((err) => {
  logger.fatal({ err }, "setup-upwork failed");
  process.exit(1);
});
