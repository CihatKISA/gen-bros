import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { ToolModules } from './collections/ToolModules'
import { Categories } from './collections/Categories'
import { SavedTopics } from './collections/SavedTopics'
import { LlmKeys } from './collections/LlmKeys'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- AI Content Topic Generator',
    },
  },
  collections: [Users, ToolModules, Categories, SavedTopics, LlmKeys],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, '../types/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    migrationDir: path.resolve(dirname, '../migrations'),
    push: true,
  }),
  sharp,
  plugins: [],
  cors: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
  csrf: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ],
})
