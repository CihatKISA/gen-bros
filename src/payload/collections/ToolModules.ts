import type { CollectionConfig } from 'payload'

export const ToolModules: CollectionConfig = {
  slug: 'tool-modules',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'enabled', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for the tool (e.g., topic-generator)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon name or path for the tool',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable or disable this tool',
      },
    },
    {
      name: 'config',
      type: 'json',
      admin: {
        description: 'Tool-specific configuration (JSON format)',
      },
    },
    {
      name: 'rateLimits',
      type: 'group',
      fields: [
        {
          name: 'requestsPerHour',
          type: 'number',
          defaultValue: 10,
          required: true,
          admin: {
            description: 'Maximum requests per hour per user',
          },
        },
        {
          name: 'requestsPerDay',
          type: 'number',
          defaultValue: 50,
          required: true,
          admin: {
            description: 'Maximum requests per day per user',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
