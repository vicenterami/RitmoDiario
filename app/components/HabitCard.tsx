import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Habit from '../../model/Habit';

interface Props {
  habit: Habit;
  onPress: () => void;
}

export default function HabitCard({ habit, onPress }: Props) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-slate-800 p-4 mb-3 rounded-xl border border-slate-700 active:bg-slate-700"
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-white text-xl font-bold">{habit.title}</Text>
        <View className="bg-slate-700 px-2 py-1 rounded">
            <Text className="text-xs text-cyan-400 uppercase font-bold">
                {habit.frequency === 'daily' ? 'Diario' : 'Semanal'}
            </Text>
        </View>
      </View>
      
      <Text className="text-slate-400 mt-2">
        Meta: <Text className="text-white font-bold">{habit.targetValue} {habit.unit}</Text> 
        {habit.frequency === 'daily' ? ' al día' : ' a la semana'}
      </Text>
    </TouchableOpacity>
  );
}