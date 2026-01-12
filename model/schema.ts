import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1, // Importante: Si cambiamos esto en el futuro, se ejecutan migraciones
  tables: [
    // 1. CATEGORÍAS (Ej: Salud, Finanzas, Lectura)
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' }, // Hex code para la UI
        { name: 'icon', type: 'string' },   // Nombre del ícono
      ]
    }),

    // 2. HÁBITOS O METAS (La definición)
    tableSchema({
      name: 'habits',
      columns: [
        { name: 'category_id', type: 'string', isIndexed: true }, // Relación con Categoría
        { name: 'title', type: 'string' },
        
        // TIPO: 'counter' (páginas), 'timer' (minutos), 'check' (si/no), 'currency' (dinero)
        { name: 'type', type: 'string' }, 
        
        // FRECUENCIA: 'daily', 'weekly', 'monthly'
        { name: 'frequency', type: 'string' },
        
        // META NUMÉRICA: Ej: 300 (páginas del libro), 2000 (calorías), 0 (si es check)
        { name: 'target_value', type: 'number' },
        
        // UNIDAD: 'pag', 'km', 'kg', 'usd', 'min'
        { name: 'unit', type: 'string' }, 
        
        // ESTADO: 'active', 'archived', 'completed'
        { name: 'status', type: 'string' },

        { name: 'created_at', type: 'number' },
      ]
    }),

    // 3. REGISTROS DIARIOS (La ejecución)
    tableSchema({
      name: 'entries',
      columns: [
        { name: 'habit_id', type: 'string', isIndexed: true }, // A qué hábito pertenece
        { name: 'amount', type: 'number' }, // Cuánto hiciste hoy (Ej: 15 pag, 1 check)
        { name: 'date', type: 'number', isIndexed: true }, // Timestamp del día (00:00)
        { name: 'note', type: 'string', isOptional: true }, // Ej: "Me sentí cansado", "Capítulo 3"
      ]
    }),
  ]
})