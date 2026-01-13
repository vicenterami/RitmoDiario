import { Model } from '@nozbe/watermelondb';
import { field, date, text, children, writer } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model'; // Importamos tipos
// ⚠️ IMPORTANTE: Usamos 'import type' para romper el ciclo de dependencias
import type Entry from './Entry'; 

export default class Habit extends Model {
  static table = 'habits';

  // 1. AÑADIR ESTO: Definir la asociación también aquí
  static associations: Associations = {
    entries: { type: 'has_many', foreignKey: 'habit_id' },
  };

  @text('title') title!: string;
  @text('type') type!: string;
  @text('frequency') frequency!: 'daily' | 'weekly';
  @field('target_value') targetValue!: number;
  @field('total_goal') totalGoal!: number;
  @text('unit') unit!: string;
  @text('status') status!: string;
  @date('created_at') createdAt!: Date;

  // 2. Decorador Children (apunta a la tabla 'entries')
  @children('entries') entries!: any; 

  // --- LÓGICA DE NEGOCIO ---
  
  // Aquí usamos 'Entry[]' solo como tipo, gracias al 'import type' de arriba
  getProgress(entriesList: Entry[]) {
    // ... (Tu misma lógica de antes) ...
    const today = new Date();
    // ...
    // Solo asegurate de importar la función getStartOfWeek si la usas
    return entriesList.reduce((sum, e) => sum + e.amount, 0); // (Resumido para el ejemplo)
  }

  @writer async deleteHabit() {
     await this.destroyPermanently();
  }
}