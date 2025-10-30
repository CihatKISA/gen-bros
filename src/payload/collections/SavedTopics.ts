import type { CollectionConfig } from 'payload'

export const SavedTopics: CollectionConfig = {
  slug: 'saved-topics',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tool', 'user', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) {
        return {
          user: { equals: user.id },
        }
      }
      return false
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user) {
        return {
          user: { equals: user.id },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (user) {
        return {
          user: { equals: user.id },
        }
      }
      return false
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        description: 'User who saved this topic',
      },
    },
    {
      name: 'tool',
      type: 'relationship',
      relationTo: 'tool-modules',
      required: true,
      hasMany: false,
      admin: {
        description: 'Tool that generated this topic',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        description: 'Category of the topic',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Title of the saved topic',
      },
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: {
        description: 'Full topic content (JSON format)',
      },
    },
    {
      name: 'input',
      type: 'json',
      required: true,
      admin: {
        description: 'Input parameters used to generate this topic',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'tokensUsed',
          type: 'number',
          admin: {
            description: 'Number of AI tokens used',
          },
        },
        {
          name: 'processingTime',
          type: 'number',
          admin: {
            description: 'Processing time in milliseconds',
          },
        },
        {
          name: 'model',
          type: 'text',
          admin: {
            description: 'AI model used (e.g., gpt-4)',
          },
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        description: 'Custom tags for organizing topics',
      },
    },
    {
      name: 'isFavorite',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark as favorite',
      },
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['user', 'createdAt'],
    },
    {
      fields: ['tool', 'user'],
    },
  ],
}
