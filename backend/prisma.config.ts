import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl =
  process.env['DATABASE_URL'] ??
  (process.env.NODE_ENV === 'production'
    ? (() => {
        throw new Error('DATABASE_URL is required in production');
      })()
    : 'postgresql://admin:admin123@localhost:5432/inventario_db');

const directUrl = process.env['DIRECT_URL'] ?? databaseUrl;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
    directUrl,
  },
});
