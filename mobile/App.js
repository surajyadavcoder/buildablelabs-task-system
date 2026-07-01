import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';

import { TaskProvider } from './src/context/TaskContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <TaskProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <HomeScreen />
      </SafeAreaView>
    </TaskProvider>
  );
}
