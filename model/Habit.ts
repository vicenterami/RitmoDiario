import { Model } from '@nozbe/watermelondb';
import { field, date, text, children, writer } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
// ⚠️ IMPORTANTE: Usamos 'import type' para evitar el ciclo "El huevo y la gallina"
import type Entry from './Entry'; 

export default class Habit extends Model {
  static table = 'habits';

  static associations: Associations = {
    entries: { type: 'has_many', foreignKey: 'habit_id' },
  };

  @text('title') title!: string;
  @text('type') type!: string;
  @text('frequency') frequency!: 'daily' | 'weekly';
  @field('target_value') targetValue!: number;
  @field('total_goal') totalGoal!: number; // Meta Global (ej: 300)
  @text('unit') unit!: string;
  @text('status') status!: string;
  @date('created_at') createdAt!: Date;

  @children('entries') entries!: any; 

  // --- LÓGICA DE PROGRESO ---

  // 1. Progreso TOTAL (Suma histórica para la Meta Final)
  getTotalProgress(entriesList: Entry[]) {
    return entriesList.reduce((sum, e) => sum + e.amount, 0);
  }

  // 2. Progreso ACTUAL (Diario o Semanal para la barra principal)
  getCurrentProgress(entriesList: Entry[]) {
    const now = new Date();
    
    // Calcular inicio del periodo (Día o Semana)
    let startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);

    if (this.frequency === 'weekly') {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Ajuste al Lunes
      startDate.setDate(diff);
    }

    // Filtramos solo las entradas desde esa fecha
    return entriesList
      .filter(e => e.date >= startDate)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  // --- ACCIONES ---

  // El decorador @writer YA INICIA la transacción. 
  // NO llamar dentro de otro database.write
  @writer async deleteHabit() {
     // Borramos primero los hijos para evitar registros huérfanos (opcional pero recomendado)
     await this.entries.destroyAllPermanently(); 
     await this.destroyPermanently();
  }
}