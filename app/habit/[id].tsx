import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import database from '../../model/index';
import Habit from '../../model/Habit';
import Entry from '../../model/Entry';

export default function HabitDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // 🛡️ SEGURIDAD: Aseguramos que el ID sea un string limpio
  const habitId = Array.isArray(id) ? id[0] : id;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [inputAmount, setInputAmount] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Cargar el Hábito y sus Entradas
  useEffect(() => {
    if (!habitId) return; // Si no hay ID aún, esperamos

    const loadData = async () => {
      try {
        console.log("🔍 Buscando hábito con ID:", habitId);
        
        // Buscamos el hábito por ID
        const habitFound = await database.get<Habit>('habits').find(habitId);
        setHabit(habitFound);

        // Observamos sus entradas (logs) en tiempo real
        const entriesSubscription = habitFound.entries.observe().subscribe(setEntries);
        
        setLoading(false);
        return () => entriesSubscription.unsubscribe();
      } catch (e: any) {
        console.error("❌ Error cargando hábito:", e); // <--- ESTO NOS DIRÁ LA VERDAD EN CONSOLA
        Alert.alert("Error", "No se pudo cargar el hábito: " + e.message);
        router.back();
      }
    };
    loadData();
  }, [habitId]);

  // 2. Calcular Progreso
  const totalProgress = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const progressPercent = habit ? Math.min((totalProgress / habit.targetValue) * 100, 100) : 0;
  const isCompleted = progressPercent >= 100;

  // 3. Agregar Progreso
  const addEntry = async () => {
    if (!inputAmount || !habit) return;
    
    try {
      await database.write(async () => {
        await database.get<Entry>('entries').create(entry => {
          entry.habit.set(habit); 
          entry.amount = Number(inputAmount);
          entry.date = new Date();
          entry.note = 'Registro manual'; 
        });
      });
      setInputAmount(''); 
      
      if (totalProgress + Number(inputAmount) >= habit.targetValue) {
        Alert.alert("¡Felicidades! 🎉", "Has cumplido tu meta diaria.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // 4. Borrar Hábito
  const deleteHabit = async () => {
    Alert.alert(
      "Eliminar Hábito",
      "¿Estás seguro? Se borrará todo el historial.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              await database.write(async () => {
                await habit?.deleteHabit(); 
              });
              router.back();
            } catch (e: any) {
              Alert.alert("Error al borrar", e.message);
            }
          }
        }
      ]
    );
  };

  if (loading || !habit) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-slate-400 mt-4">Cargando hábito...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="p-5 flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Text className="text-slate-400 text-lg">← Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteHabit} className="p-2 bg-red-900/30 rounded-lg">
            <Text className="text-red-400 font-bold">Eliminar</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-3xl text-white font-bold mb-1">{habit.title}</Text>
        <Text className="text-slate-400 mb-6 uppercase tracking-widest text-xs">
          {habit.type} • {habit.frequency}
        </Text>

        {/* Tarjeta de Progreso */}
        <View className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-400">Progreso Actual</Text>
            <Text className="text-white font-bold text-xl">
              {totalProgress} / {habit.targetValue} <Text className="text-sm text-slate-400">{habit.unit}</Text>
            </Text>
          </View>
          
          <View className="h-4 bg-slate-900 rounded-full overflow-hidden">
            <View 
              className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
              style={{ width: `${progressPercent}%` }} 
            />
          </View>
          <Text className="text-right text-slate-500 text-xs mt-2">
            {progressPercent.toFixed(1)}% completado
          </Text>
        </View>

        {/* Input para agregar registro */}
        <Text className="text-white font-bold mb-3">Registrar Avance</Text>
        <View className="flex-row gap-3 mb-8">
          <TextInput 
            className="flex-1 bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
            placeholder="0"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={inputAmount}
            onChangeText={setInputAmount}
          />
          <TouchableOpacity 
            onPress={addEntry}
            className="bg-blue-600 justify-center px-6 rounded-xl active:bg-blue-700"
          >
            <Text className="text-white font-bold text-lg">+</Text>
          </TouchableOpacity>
        </View>

        {/* Historial */}
        <Text className="text-white font-bold mb-3">Historial Reciente</Text>
        <FlatList
          data={[...entries].reverse()} 
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View className="flex-row justify-between py-3 border-b border-slate-800">
              <Text className="text-slate-400">
                {item.date.toLocaleDateString()}
              </Text>
              <Text className="text-emerald-400 font-bold">
                +{item.amount} {habit.unit}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text className="text-slate-600 italic">Sin registros aún.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}