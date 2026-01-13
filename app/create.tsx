import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import database from '../model/index';
import Habit from '../model/Habit';

export default function CreateHabit() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [dailyTarget, setDailyTarget] = useState('');
  const [totalGoal, setTotalGoal] = useState(''); 
  const [unit, setUnit] = useState('');
  // Nuevo estado para la frecuencia
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const saveHabit = async () => {
    if (!title || !dailyTarget) {
      Alert.alert('Faltan datos', 'El título y la meta son obligatorios.');
      return;
    }

    try {
      await database.write(async () => {
        await database.get<Habit>('habits').create(habit => {
          habit.title = title;
          habit.type = 'counter';
          habit.frequency = frequency; // <--- Usamos la selección
          habit.targetValue = Number(dailyTarget);
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

        {/* 1. Título */}
        <View className="mb-6">
          <Text className="text-slate-400 mb-2 font-bold">1. ¿Qué quieres lograr?</Text>
          <TextInput
            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
            placeholder="Ej: Ir al Gym / Leer"
            placeholderTextColor="#64748b"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* 2. Frecuencia (NUEVO) */}
        <View className="mb-6">
          <Text className="text-slate-400 mb-2 font-bold">2. ¿Con qué frecuencia?</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => setFrequency('daily')}
              className={`flex-1 p-4 rounded-xl border ${frequency === 'daily' ? 'bg-blue-600 border-blue-400' : 'bg-slate-800 border-slate-700'}`}
            >
              <Text className={`text-center font-bold ${frequency === 'daily' ? 'text-white' : 'text-slate-400'}`}>📅 Diario</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setFrequency('weekly')}
              className={`flex-1 p-4 rounded-xl border ${frequency === 'weekly' ? 'bg-purple-600 border-purple-400' : 'bg-slate-800 border-slate-700'}`}
            >
              <Text className={`text-center font-bold ${frequency === 'weekly' ? 'text-white' : 'text-slate-400'}`}>🗓️ Semanal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Meta */}
        <View className="mb-6">
          <Text className="text-slate-400 mb-2 font-bold">
            3. Meta {frequency === 'daily' ? 'Diaria' : 'Semanal'}
          </Text>
          <View className="flex-row gap-4">
            <TextInput
              className="flex-1 bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
              placeholder={frequency === 'daily' ? "Ej: 20" : "Ej: 3 (días)"}
              keyboardType="numeric"
              placeholderTextColor="#64748b"
              value={dailyTarget}
              onChangeText={setDailyTarget}
            />
            <TextInput
              className="flex-1 bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
              placeholder="Unidad (págs, veces)"
              placeholderTextColor="#64748b"
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        {/* 4. Meta Final */}
        <View className="mb-8">
          <Text className="text-emerald-400 mb-2 font-bold">4. Meta Final (Opcional)</Text>
          <TextInput
            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
            placeholder="Ej: 400 total"
            keyboardType="numeric"
            placeholderTextColor="#64748b"
            value={totalGoal}
            onChangeText={setTotalGoal}
          />
        </View>

        <TouchableOpacity onPress={saveHabit} className="bg-emerald-500 p-4 rounded-xl mb-10">
          <Text className="text-slate-900 font-bold text-center text-lg">Crear Hábito</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}