import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, relation } from '@nozbe/watermelondb/decorators'
import { Associations } from '@nozbe/watermelondb/Model'
// ⚠️ IMPORTANTE: Usamos 'import type' para evitar el ciclo "El huevo y la gallina"
import type Habit from './Habit'

export default class Entry extends Model {
  static table = 'entries'

  static associations: Associations = {
    habits: { type: 'belongs_to', key: 'habit_id' },
  }

  @field('amount') amount!: number
  @date('date') date!: Date
  @field('note') note!: string

  // Definimos la relación
  @relation('habits', 'habit_id') habit!: Relation<Habit> 
}