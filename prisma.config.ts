import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
    schema: './src/prisma/schema',
    datasource: {
        url: process.env.DB_URI,
        // Scratch database for prisma migrations testing
        shadowDatabaseUrl: process.env.SHADOW_DB_URI,
    },
    migrations: {
        path: './src/prisma/migrations',
        seed: 'npx tsx src/prisma/seeder/seed.ts',
    }
})
