import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No ISR or revalidation in ReRoom, so the default (static assets only) cache is enough.
export default defineCloudflareConfig({});
