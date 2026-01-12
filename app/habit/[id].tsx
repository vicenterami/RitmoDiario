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
    const loadData = async () => {
      try {
        const habitFound = await database.get<Habit>('habits').find(habitId);
        setHabit(habitFound);
        // Observamos TODAS las entradas
        const subscription = habitFound.entries.observe().subscribe(setEntries);
        setLoading(false);
        return () => subscription.unsubscribe();
      } catch (e) {
        Alert.alert("Error", "No se encontró el hábito");
        router.back();
      }
    };
    loadData();
  }, [habitId]);

  // --- LÓGICA DE PROGRESO ---

  // 1. Filtramos solo las entradas de HOY para la barra diaria
  const todayStr = new Date().toDateString(); // "Mon Jan 12 2026"
  const dailyEntries = entries.filter(e => e.date.toDateString() === todayStr);
  const dailyProgress = dailyEntries.reduce((sum, e) => sum + e.amount, 0);

  // 2. Calculamos el total acumulado de la historia
  const totalAccumulated = entries.reduce((sum, e) => sum + e.amount, 0);

  // 3. Porcentajes
  const dailyPercent = habit ? Math.min((dailyProgress / habit.targetValue) * 100, 100) : 0;
  
  // Solo calculamos porcentaje total si existe una meta final (totalGoal > 0)
  const hasTotalGoal = habit && habit.totalGoal > 0;
  const totalPercent = hasTotalGoal ? Math.min((totalAccumulated / habit.totalGoal) * 100, 100) : 0;

  // --------------------------

  const addEntry = async () => {
    if (!inputAmount || !habit) return;
    try {
      await database.write(async () => {
        await database.get<Entry>('entries').create(entry => {
          entry.habit.set(habit);
          entry.amount = Number(inputAmount);
          entry.date = new Date();
          entry.note = 'Manual';
        });
      });
      setInputAmount('');
    } catch (e: any) { Alert.alert("Error", e.message); }
  };

  const deleteHabit = async () => { /* ... (Mismo código de antes) ... */ };

  if (loading || !habit) return <ActivityIndicator className="mt-10" />;

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="p-5 flex-1">
        {/* Header simple */}
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-slate-400">← Volver</Text>
        </TouchableOpacity>

        <Text className="text-3xl text-white font-bold mb-1">{habit.title}</Text>
        <View className="bg-slate-800 self-start px-2 py-1 rounded mb-6">
             <Text className="text-xs text-cyan-400 uppercase font-bold">{habit.frequency}</Text>
        </View>

        {/* --- TARJETA PROGRESO DIARIO (HOY) --- */}
        <View className="bg-slate-800 p-5 rounded-2xl border border-slate-700 mb-6 relative overflow-hidden">
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-300 font-bold">📅 Progreso de Hoy</Text>
            <Text className="text-white font-bold text-xl">
              {dailyProgress} <Text className="text-slate-500 text-sm">/ {habit.targetValue} {habit.unit}</Text>
            </Text>
          </View>
          <View className="h-4 bg-slate-900 rounded-full overflow-hidden">
            <View className="h-full bg-emerald-500" style={{ width: `${dailyPercent}%` }} />
          </View>
          <Text className="text-right text-emerald-400 text-xs mt-1">
            {dailyPercent >= 100 ? '¡Meta diaria cumplida! 🎉' : 'Sigue así'}
          </Text>
        </View>

        {/* --- TARJETA PROGRESO FINAL (LIBRO COMPLETO) --- */}
        {hasTotalGoal && (
           <View className="bg-slate-900 p-5 rounded-2xl border border-slate-800 mb-8">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-400 font-bold">🏔️ Meta Final</Text>
              <Text className="text-slate-200 font-bold">
                {totalAccumulated} / {habit.totalGoal}
              </Text>
            </View>
            <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <View className="h-full bg-blue-600" style={{ width: `${totalPercent}%` }} />
            </View>
            <Text className="text-slate-500 text-xs mt-2 text-right">
              {totalPercent.toFixed(1)}% completado del total
            </Text>
          </View>
        )}

        {/* Input */}
        <Text className="text-white font-bold mb-3">Registrar Avance</Text>
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

        {/* Historial (Solo visual) */}
        <Text className="text-white font-bold mb-3">Historial</Text>
        <FlatList
          data={[...entries].reverse()} 
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View className="flex-row justify-between py-3 border-b border-slate-800">
              <Text className="text-slate-400">{item.date.toLocaleDateString()}</Text>
              <Text className="text-emerald-400 font-bold">+{item.amount} {habit.unit}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}