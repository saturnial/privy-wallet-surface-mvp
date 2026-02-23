import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { recipients } from './schema';

async function seed() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    console.error('POSTGRES_URL env var is required');
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log('Seeding recipients...');

  await db
    .insert(recipients)
    .values([
      { id: 'r1', name: 'Acme Corp', nickname: 'acme', createdAt: new Date('2025-01-15T10:00:00Z') },
      { id: 'r2', name: 'Jane Smith', nickname: 'jane', createdAt: new Date('2025-02-01T10:00:00Z') },
      { id: 'r3', name: 'Global Payments Inc', nickname: 'gpi', createdAt: new Date('2025-03-10T10:00:00Z') },
    ])
    .onConflictDoNothing();

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
