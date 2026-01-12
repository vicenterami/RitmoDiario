import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'habits',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'frequency', type: 'string' },
        { name: 'target_value', type: 'number' }, // Meta diaria
        { name: 'total_goal', type: 'number', isOptional: true }, // <--- NUEVO: Meta Final (ej: 300)
        { name: 'unit', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'entries',
      columns: [
        { name: 'habit_id', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'date', type: 'number' },
        { name: 'note', type: 'string', isOptional: true },
      ],
    }),
  ],
})