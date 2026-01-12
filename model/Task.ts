import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Task extends Model {
  static table = 'tasks'

  @field('title') title!: string
  @field('is_completed') isCompleted!: boolean
  @readonly @date('created_at') createdAt!: number
}
