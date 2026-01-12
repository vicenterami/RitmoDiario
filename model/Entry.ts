import { Model, Relation } from '@nozbe/watermelondb'
import { field, date, relation } from '@nozbe/watermelondb/decorators'
import Habit from './Habit'

export default class Entry extends Model {
  static table = 'entries'

  @field('amount') amount!: number
  @date('date') date!: Date
  @field('note') note!: string

  // 2. CAMBIO IMPORTANTE:
  // Antes decía: habit!: Habit
  // Ahora debe decir:
  @relation('habits', 'habit_id') habit!: Relation<Habit> 
}