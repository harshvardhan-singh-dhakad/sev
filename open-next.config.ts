import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();
// OpenNext invokes this command to build Next.js itself. Keep it separate from
// `build`, which is the Cloudflare Workers build entry point used by CI.
config.buildCommand = "npm run build:next";

export default config;
