import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import database from '../../model/index';
import Habit from '../../model/Habit';
import Entry from '../../model/Entry';

export default function HabitDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const habitId = Array.isArray(id) ? id[0] : id;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [inputAmount, setInputAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!habitId) return;
    
    // Optimizacion: Usar el método 'findAndObserve' si tienes helpers, 
    // pero manual está bien para entenderlo.
    const loadData = async () => {
      try {
        const habitFound = await database.get<Habit>('habits').find(habitId);
        setHabit(habitFound);
        // Observamos entries
        const subscription = habitFound.entries.observe().subscribe(setEntries);
        setLoading(false);
        return () => subscription.unsubscribe();
      } catch (e) {
        router.replace('/');
      }
    };
    loadData();
  }, [habitId]);

  // --- LÓGICA DE BORRADO ---
  const deleteHabit = () => {
    Alert.alert("Eliminar Hábito", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => {
           // Delegación al index
           router.replace({ pathname: '/', params: { action: 'delete_habit', targetId: habitId } });
      }}
    ]);
  };

  // --- USO DEL MODELO INTELIGENTE ---
  // Ya no calculamos aquí, le preguntamos al modelo.
  const currentProgress = habit ? habit.getProgress(entries) : 0;
  
  // Porcentajes (Lógica de UI)
  const currentPercent = habit ? Math.min((currentProgress / habit.targetValue) * 100, 100) : 0;

  const addEntry = async () => {
    if (!inputAmount || !habit || isNaN(Number(inputAmount))) return; // Validación extra
    try {
      await database.write(async () => {
        await database.get<Entry>('entries').create(entry => {
          entry.habit.set(habit);
          entry.amount = Number(inputAmount);
          entry.date = new Date();
        });
      });
      setInputAmount('');
    } catch (e: any) { Alert.alert("Error", e.message); }
  };
  
    const deleteEntry = (entry: Entry) => {
    // ... Tu código de deleteEntry ...
     Alert.alert("Eliminar registro", "¿Borrar?", [
        { text: "Cancelar", style: "cancel" },
        { 
            text: "Borrar", style: 'destructive',
            onPress: async () => {
                try {
                    await database.write(async () => {
                        await entry.destroyPermanently();
                    });
                } catch(e) { console.log(e); }
            }
        }
    ]);
  };

  if (loading) return <ActivityIndicator className="mt-10" color="#fff" />;
  if (!habit) return null;

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="p-5 flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-slate-400 text-lg">← Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteHabit}>
                <Text className="text-red-400 font-bold text-lg">🗑️</Text>
            </TouchableOpacity>
        </View>

        <Text className="text-3xl text-white font-bold mb-1">{habit.title}</Text>
        
        {/* Barra de Progreso */}
        <View className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-6 mt-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-300 font-bold">
                {habit.frequency === 'weekly' ? "Progreso Semanal" : "Progreso Diario"}
            </Text>
            <Text className="text-white font-bold text-xl">
              {currentProgress} <Text className="text-slate-500 text-sm">/ {habit.targetValue} {habit.unit}</Text>
            </Text>
          </View>
          <View className="h-4 bg-slate-900 rounded-full overflow-hidden">
            <View 
                className={`h-full ${currentPercent >= 100 ? 'bg-emerald-400' : 'bg-blue-500'}`} 
                style={{ width: `${currentPercent}%` }} 
            />
          </View>
        </View>

        {/* Input */}
        <View className="flex-row gap-3 mb-8">
          <TextInput 
            className="flex-1 bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
            placeholder="Cantidad"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={inputAmount}
            onChangeText={setInputAmount}
          />
          <TouchableOpacity onPress={addEntry} className="bg-blue-600 justify-center px-6 rounded-xl">
            <Text className="text-white font-bold text-2xl">+</Text>
          </TouchableOpacity>
        </View>

        {/* Lista Historial */}
        <Text className="text-white font-bold mb-3">Historial</Text>
        <FlatList
          data={[...entries].reverse()} 
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center py-3 border-b border-slate-800">
              <Text className="text-slate-400">
                {item.date.toLocaleDateString()}
              </Text>
              <View className="flex-row items-center gap-4">
                  <Text className="text-emerald-400 font-bold text-lg">+{item.amount}</Text>
                  <TouchableOpacity onPress={() => deleteEntry(item)} className="bg-red-900/40 px-3 py-1 rounded">
                    <Text className="text-red-400 text-xs">🗑️</Text>
                  </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}