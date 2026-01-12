import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import database from '../model/index';
import Habit from '../model/Habit';

export default function CreateHabit() {
  const router = useRouter();
  
  // Estados locales para el formulario
  const [title, setTitle] = useState('');
  const [type, setType] = useState('counter'); // counter, check, currency
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');

  const saveHabit = async () => {
    if (!title || !target) {
      Alert.alert('Faltan datos', 'Por favor pon un título y una meta.');
      return;
    }

    try {
      await database.write(async () => {
        await database.get<Habit>('habits').create(habit => {
          habit.title = title;
          habit.type = type; // Por ahora manual, luego haremos selectores bonitos
          habit.frequency = 'daily';
          habit.targetValue = Number(target);
          habit.unit = unit || 'uni';
          habit.status = 'active';
          habit.createdAt = new Date();
        });
      });
      // Volver atrás al guardar
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="p-5">
        <Text className="text-white text-2xl font-bold mb-6">Nuevo Desafío 🚀</Text>

        {/* Input Título */}
        <View className="mb-4">
          <Text className="text-slate-400 mb-2">Nombre del Hábito</Text>
          <TextInput
            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
            placeholder="Ej: Leer Clean Code"
            placeholderTextColor="#64748b"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Input Meta Numérica */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-slate-400 mb-2">Meta Diaria</Text>
            <TextInput
              className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
              placeholder="Ej: 20"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={target}
              onChangeText={setTarget}
            />
          </View>
          <View className="flex-1">
            <Text className="text-slate-400 mb-2">Unidad</Text>
            <TextInput
              className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 text-lg"
              placeholder="pags, min, kg"
              placeholderTextColor="#64748b"
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        {/* Selector de Tipo (Simplificado visualmente por ahora) */}
        <Text className="text-slate-400 mb-2">Tipo de seguimiento</Text>
        <View className="flex-row gap-2 mb-8">
          {['counter', 'check', 'currency'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setType(t)}
              className={`p-3 rounded-lg border ${type === t ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
            >
              <Text className="text-white capitalize">{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          onPress={saveHabit}
          className="bg-emerald-500 p-4 rounded-xl active:bg-emerald-600"
        >
          <Text className="text-slate-900 font-bold text-center text-lg">
            Crear Hábito
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}