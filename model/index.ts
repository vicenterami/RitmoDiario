import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema'; // Asegurate que sea 'schema' o 'Schema' segun tu archivo
import migrations from './migrations';
import Task from './Task'; // Tu modelo

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  // ⚠️ ESTA ES LA CLAVE: Desactiva JSI para que funcione en Expo Go
  jsi: false, 
  
  onSetUpError: error => {
    console.log("Error cargando DB:", error);
  }
});

const database = new Database({
  adapter,
  modelClasses: [
    Task,
  ],
});

export default database;