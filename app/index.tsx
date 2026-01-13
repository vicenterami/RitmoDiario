import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Alert } from 'react-native';
import database from '../model/index';
import Habit from '../model/Habit';
import { useRouter, useLocalSearchParams } from 'expo-router';
import HabitCard from './components/HabitCard';

export default function Page() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { action, targetId } = params;
  const [habits, setHabits] = useState<Habit[]>([]);

  // 1. Manejo de borrado delegado
  useEffect(() => {
    if (action === 'delete_habit' && targetId) {
      const performDelete = async () => {
        try {
            const id = Array.isArray(targetId) ? targetId[0] : targetId;
                        
            // ✅ AHORA (BIEN): Buscamos y ejecutamos directo.
            // WatermelonDB maneja la transacción dentro del modelo gracias a @writer
            const habit = await database.get<Habit>('habits').find(id);
            await habit.deleteHabit(); 
            
        } catch(e) { 
            console.log("Error borrando:", e); 
        } finally { 
            router.setParams({ action: '', targetId: '' }); 
        }
      };
      setTimeout(performDelete, 500);
    }
  }, [action, targetId]);


  // Cargar Hábitos (Observer en tiempo real)
  useEffect(() => {
      const subscription = database.get<Habit>('habits').query().observe().subscribe(setHabits);
      return () => subscription.unsubscribe();
  }, []);

  // 2. Crear un Hábito de prueba (Ejemplo: Leer Libro)
  const createTestHabit = async () => {
    try {
      await database.write(async () => {
        const habitsCollection = database.get<Habit>('habits');
        await habitsCollection.create(habit => {
          habit.title = 'Leer Clean Code';
          habit.type = 'counter'; // Tipo contador
          habit.frequency = 'daily';
          habit.targetValue = 20; // 20 páginas
          habit.unit = 'pags';
          habit.status = 'active';
          habit.createdAt = new Date();
        });
      });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // 3. Borrar todo (Para limpiar pruebas)
  const clearAll = async () => {
    try {
      await database.write(async () => {
        // Obtenemos todos los hábitos y los marcamos para borrar
        const allHabits = await database.get<Habit>('habits').query().fetch();
        // WatermelonDB requiere borrar en batch si son muchos, o uno por uno
        for (const habit of allHabits) {
          // Usamos el método que creamos en el modelo (si lo pusiste) o destroyPermanently
          await habit.destroyPermanently(); 
        }
      });
    } catch (e: any) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 p-5">
        <Text className="text-3xl font-bold text-white mb-2 text-center">
          Mis Hábitos 🎯
        </Text>
        <Text className="text-slate-400 text-center mb-6">
          Versión Avanzada (V1)
        </Text>

        {/* Botonera de Acciones */}
        <View className="flex-row justify-between mb-6 gap-2">
          <TouchableOpacity 
            onPress={() => router.push('/create')}
            className="flex-1 bg-emerald-600 p-4 rounded-xl active:bg-emerald-700"
            >
              <Text className="text-white text-center font-bold">
                + Nuevo Hábito
              </Text>
            </TouchableOpacity>
          <TouchableOpacity 
            onPress={clearAll}
            className="bg-red-900/50 p-4 rounded-xl active:bg-red-800"
          >
            <Text className="text-red-300 font-bold">
              Borrar Todo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Hábitos */}
        <FlatList
          data={habits}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <HabitCard 
                habit={item} 
                onPress={() => router.push(`/habit/${item.id}`)} 
            />
          )}
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Text className="text-slate-500 text-lg">No hay hábitos aún.</Text>
              <Text className="text-slate-600 text-sm mt-2">Crea uno para empezar a trackear.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}