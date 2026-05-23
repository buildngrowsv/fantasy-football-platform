/**
 * OpenNext Cloudflare adapter — queue only (no R2 ISR cache on first deploy).
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

export default defineCloudflareConfig({
  queue: doQueue,
});
