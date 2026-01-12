import { Model } from '@nozbe/watermelondb'
import { field, date, children, writer } from '@nozbe/watermelondb/decorators'

export default class Habit extends Model {
  static table = 'habits'

  // Campos simples
  @field('title') title!: string
  @field('type') type!: string // 'counter', 'check', etc
  @field('frequency') frequency!: string
  @field('target_value') targetValue!: number
  @field('unit') unit!: string
  @field('status') status!: string
  @date('created_at') createdAt!: Date

  // Relación: Un Hábito tiene muchas Entradas (Logs)
  @children('entries') entries: any

  // Helper para borrar todo
  @writer async deleteHabit() {
    await this.entries.destroyAllPermanently() // Borra sus logs primero
    await this.markAsDeleted() // Luego borra el hábito
  }
}