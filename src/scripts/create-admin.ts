import { getPayload } from 'payload'
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

dotenvConfig({ path: resolve(process.cwd(), '.env') })

import config from '../payload/payload.config'

async function createAdmin() {
  const payload = await getPayload({ config })

  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@example.com',
      password: 'password',
      role: 'admin',
    },
  })

  console.log('Admin user created successfully!')
  process.exit(0)
}

createAdmin()
