import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from './schema'
import Habit from './Habit'
import Entry from './Entry'
// Importa Category si creaste el modelo, sino déjalo pendiente

const adapter = new SQLiteAdapter({
  schema,
  // (opcional) migrations, // Lo veremos cuando lances la v2
  jsi: true, 
  onSetUpError: error => { console.log(error) }
})

const database = new Database({
  adapter,
  modelClasses: [
    Habit,
    Entry,
    // Category
  ],
})

export default database