import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import database from '../model/index';
import Habit from '../model/Habit';

export default function CreateHabit() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [dailyTarget, setDailyTarget] = useState(''); // Meta Diaria
  const [totalGoal, setTotalGoal] = useState('');     // Meta Final (Opcional)
  const [unit, setUnit] = useState('');

  const saveHabit = async () => {
    if (!title || !dailyTarget) {
      Alert.alert('Faltan datos', 'El título y la meta diaria son obligatorios.');
      return;
    }

    try {
      await database.write(async () => {
        await database.get<Habit>('habits').create(habit => {
          habit.title = title;
          habit.type = 'counter';
          habit.frequency = 'daily';
          habit.targetValue = Number(dailyTarget);
          // Si el usuario puso meta final, la guardamos, si no, es 0
          habit.totalGoal = totalGoal ? Number(totalGoal) : 0; 
          habit.unit = unit || 'veces';
          habit.status = 'active';
          habit.createdAt = new Date();
        });
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="p-5">
        <Text className="text-white text-2xl font-bold mb-6">Nuevo Desafío 🚀</Text>

        <View className="mb-6">
          <Text className="text-slate-400 mb-2 font-bold">1. ¿Qué quieres lograr?</Text>
          <TextInput
            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
            placeholder="Ej: Leer Clean Code"
            placeholderTextColor="#64748b"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mb-6">
          <Text className="text-slate-400 mb-2 font-bold">2. Meta Diaria (Reinicio cada día)</Text>
          <View className="flex-row gap-4">
            <TextInput
              className="flex-1 bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
              placeholder="Ej: 20"
              keyboardType="numeric"
              placeholderTextColor="#64748b"
              value={dailyTarget}
              onChangeText={setDailyTarget}
            />
            <TextInput
              className="flex-1 bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
              placeholder="Unidad (págs)"
              placeholderTextColor="#64748b"
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-emerald-400 mb-2 font-bold">3. Meta Final (Opcional)</Text>
          <Text className="text-slate-500 text-xs mb-2">
            ¿Quieres completar un total a largo plazo? (Ej: El libro tiene 400 páginas)
          </Text>
          <TextInput
            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
            placeholder="Ej: 400"
            keyboardType="numeric"
            placeholderTextColor="#64748b"
            value={totalGoal}
            onChangeText={setTotalGoal}
          />
        </View>

        <TouchableOpacity onPress={saveHabit} className="bg-emerald-500 p-4 rounded-xl active:bg-emerald-600 shadow-lg shadow-emerald-500/20">
          <Text className="text-slate-900 font-bold text-center text-lg">Crear Hábito</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}