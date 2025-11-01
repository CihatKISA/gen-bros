import type { CollectionConfig } from 'payload'

export const LlmKeys: CollectionConfig = {
  slug: 'llm-keys',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'provider', 'isEnabled', 'createdAt'],
    description: 'Manage API keys for AI models.',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Key Name',
      admin: {
        description: 'A recognizable name for this key (e.g., OpenAI GPT-4).',
      },
    },
    {
      name: 'apiKey',
      type: 'text',
      required: true,
      label: 'API Key',
      admin: {
        description: 'The API key from the LLM provider.',
        hidden: true,
      },
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      label: 'Provider',
      options: [
        { label: 'OpenAI', value: 'openai' },
        { label: 'Anthropic', value: 'anthropic' },
        { label: 'Google AI', value: 'google_ai' },
      ],
      defaultValue: 'openai',
    },
    {
      name: 'isEnabled',
      type: 'checkbox',
      label: 'Enabled',
      defaultValue: true,
      admin: {
        description: 'Whether this key is active for use.',
      },
    },
  ],
  timestamps: true,
}
