import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://mc@localhost:5432/asatra?schema=public',
  },
  migrations: {
    seed: 'ts-node --transpile-only --compiler-options {"module":"CommonJS","moduleResolution":"node"} prisma/seed.ts',
  },
});
