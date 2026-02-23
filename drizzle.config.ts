import { readFileSync } from 'fs';
import { defineConfig } from 'drizzle-kit';

// Load .env.development.local (Next.js convention, not auto-loaded by drizzle-kit)
for (const envFile of ['.env.development.local', '.env.local', '.env']) {
  try {
    const contents = readFileSync(envFile, 'utf-8');
    for (const line of contents.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*"?(.*?)"?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
    break;
  } catch {
    // file doesn't exist, try next
  }
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
