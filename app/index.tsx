import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, FlatList, SafeAreaView, StatusBar } from 'react-native';

// 1. DESCOMENTAMOS LA DB
import database from '../model/index';
import Task from '../model/Task';

export default function Page() {
  // Usamos el tipo Task real, no el Mock
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string>('');

  // 2. Lógica de carga real (Observer)
  useEffect(() => {
    try {
      const tasksCollection = database.get<Task>('tasks');
      const subscription = tasksCollection.query().observe().subscribe(data => {
        setTasks(data);
      });
      return () => subscription.unsubscribe();
    } catch (e: any) {
      console.log(e); // Ver error en consola
      setError('Error DB: ' + e.message);
    }
  }, []);

  // 3. Crear tarea real en DB
  const addNewTask = async () => {
    try {
      await database.write(async () => {
        await database.get<Task>('tasks').create(task => {
          task.title = 'Tarea ' + Math.floor(Math.random() * 1000);
          task.isCompleted = false;
        });
      });
    } catch (e: any) {
      setError('Error al crear: ' + e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 p-5 pt-10">
        <Text className="text-3xl font-bold text-white mb-6 text-center">
          RitmoDiario 🥁
        </Text>

        {error ? (
          <View className="bg-red-500 p-3 rounded mb-4">
            <Text className="text-white font-bold">¡Error de Base de Datos!</Text>
            <Text className="text-white">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          onPress={addNewTask}
          className="bg-blue-600 p-4 rounded-xl mb-6 active:bg-blue-700"
        >
          <Text className="text-white text-center font-bold text-lg">
            + Nueva Tarea (DB Real)
          </Text>
        </TouchableOpacity>

        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View className="bg-gray-800 p-4 mb-3 rounded-lg border border-gray-700">
              <Text className="text-white text-lg font-semibold">{item.title}</Text>
              <Text className="text-gray-400 text-sm">
                ID: {item.id}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-gray-500 text-center mt-10">
              Presiona el botón para guardar en WatermelonDB.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}