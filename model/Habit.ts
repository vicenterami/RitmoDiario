import { Model } from '@nozbe/watermelondb'
import { field, date, children, writer } from '@nozbe/watermelondb/decorators'
import { Associations } from '@nozbe/watermelondb/Model' // <--- 1. Importamos esto

export default class Habit extends Model {
  static table = 'habits'
  static associations: Associations = {
    entries: { type: 'has_many', foreignKey: 'habit_id' },
  }

  @field('title') title!: string
  @field('type') type!: string
  @field('frequency') frequency!: string
  @field('target_value') targetValue!: number
  @field('total_goal') totalGoal!: number
  @field('unit') unit!: string
  @field('status') status!: string
  @date('created_at') createdAt!: Date

  @children('entries') entries: any

  @writer async deleteHabit() {
    await this.entries.destroyAllPermanently()
    await this.markAsDeleted()
  }
}