import "dotenv/config";

import { logger } from "../logger.js";

// Phase 1.1: opens a headed Playwright browser, prompts user to login manually,
// then saves storageState to data/auth/armut-state.json for headless re-use.

async function main(): Promise<void> {
  logger.info("setup-armut placeholder — implementation lands in Phase 1.1");
  logger.info(
    "Will: launch headed browser → navigate to Armut → wait for manual login → save data/auth/armut-state.json",
  );
}

main().catch((err) => {
  logger.fatal({ err }, "setup-armut failed");
  process.exit(1);
});
