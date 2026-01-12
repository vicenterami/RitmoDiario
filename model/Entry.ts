import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, relation } from '@nozbe/watermelondb/decorators'
import { Associations } from '@nozbe/watermelondb/Model' // <--- 1. Importamos esto
import Habit from './Habit'

export default class Entry extends Model {
  static table = 'entries'

  // 2. Le ponemos el tipo explícito aquí 👇
  static associations: Associations = {
    habits: { type: 'belongs_to', key: 'habit_id' },
  }

  @field('amount') amount!: number
  @date('date') date!: Date
  @field('note') note!: string

  @relation('habits', 'habit_id') habit!: Relation<Habit> 
}