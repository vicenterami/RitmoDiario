import { Model } from '@nozbe/watermelondb'
import { field, date, relation } from '@nozbe/watermelondb/decorators'
import Habit from './Habit'

export default class Entry extends Model {
  static table = 'entries'

  @field('amount') amount!: number
  @date('date') date!: Date
  @field('note') note!: string

  // Relación: Una entrada pertenece a un Hábito
  @relation('habits', 'habit_id') habit!: Habit
}