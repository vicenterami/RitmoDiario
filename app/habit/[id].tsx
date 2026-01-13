import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
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

  const deleteHabit = () => {
    Alert.alert("Eliminar Hábito", "Se borrará todo el historial. ¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => {
           router.replace({ pathname: '/', params: { action: 'delete_habit', targetId: habitId } });
      }}
    ]);
  };

  // --- CÁLCULOS ---
  // 1. Progreso Periodo (Diario/Semanal)
  const currentVal = habit ? habit.getCurrentProgress(entries) : 0;
  const currentPercent = habit ? Math.min((currentVal / habit.targetValue) * 100, 100) : 0;

  // 2. Progreso TOTAL (Si existe totalGoal)
  const totalVal = habit ? habit.getTotalProgress(entries) : 0;
  const hasTotalGoal = habit && habit.totalGoal > 0;
  const totalPercent = (hasTotalGoal && habit) ? Math.min((totalVal / habit.totalGoal) * 100, 100) : 0;


  const addEntry = async () => {
    if (!inputAmount || !habit || isNaN(Number(inputAmount))) return;
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
      <ScrollView className="p-5 flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-slate-400 text-lg">← Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteHabit}>
                <Text className="text-red-400 font-bold text-lg">🗑️ Eliminar</Text>
            </TouchableOpacity>
        </View>

        <Text className="text-3xl text-white font-bold mb-1">{habit.title}</Text>
        
        {/* --- TARJETA 1: PROGRESO ACTUAL --- */}
        <View className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-4 mt-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-300 font-bold">
                {habit.frequency === 'weekly' ? "Esta Semana" : "Hoy"}
            </Text>
            <Text className="text-white font-bold text-xl">
              {currentVal} <Text className="text-slate-500 text-sm">/ {habit.targetValue} {habit.unit}</Text>
            </Text>
          </View>
          <View className="h-4 bg-slate-900 rounded-full overflow-hidden">
            <View 
                className={`h-full ${currentPercent >= 100 ? 'bg-emerald-400' : 'bg-blue-500'}`} 
                style={{ width: `${currentPercent}%` }} 
            />
          </View>

          <Text className="text-right text-slate-500 text-xs mt-2">
            {currentPercent.toFixed(1)}% completado
          </Text>
        </View>

        {/* --- TARJETA 2: META TOTAL (Solo si existe) --- */}
        {hasTotalGoal && (
             <View className="bg-indigo-900/30 p-5 rounded-2xl border border-indigo-500/30 mb-6">
             <View className="flex-row justify-between mb-2">
               <Text className="text-indigo-200 font-bold">
                   🏁 Meta Final
               </Text>
               <Text className="text-white font-bold text-xl">
                 {totalVal} <Text className="text-slate-500 text-sm">/ {habit.totalGoal} {habit.unit}</Text>
               </Text>
             </View>
             <View className="h-4 bg-slate-900 rounded-full overflow-hidden">
               <View 
                   className="h-full bg-indigo-500" 
                   style={{ width: `${totalPercent}%` }} 
               />
             </View>

             <Text className="text-right text-indigo-300 text-xs mt-2">
              {totalPercent.toFixed(1)}% del objetivo total
             </Text>

             {totalPercent >= 100 && (
                 <Text className="text-yellow-400 font-bold text-center mt-2">¡META FINAL COMPLETADA! 🏆</Text>
             )}
           </View>
        )}

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
        <Text className="text-white font-bold mb-3">Historial Reciente</Text>
        {/* Usamos map en lugar de FlatList dentro de ScrollView para evitar warnings */}
        <View>
            {[...entries].reverse().map((item) => (
                <View key={item.id} className="flex-row justify-between items-center py-3 border-b border-slate-800">
                    <Text className="text-slate-400">
                    {item.date.toLocaleDateString()}
                    </Text>
                    <View className="flex-row items-center gap-4">
                        <Text className="text-emerald-400 font-bold text-lg">+{item.amount}</Text>
                        <TouchableOpacity onPress={() => deleteEntry(item)} className="bg-red-900/40 px-3 py-1 rounded">
                        <Text className="text-red-400 text-xs">Borrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}