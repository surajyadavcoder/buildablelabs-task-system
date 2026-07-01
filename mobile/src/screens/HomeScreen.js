import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useTasks } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';

export default function HomeScreen() {
  const { tasks, isOnline, loading, addTask, toggleTask, editTask, removeTask } = useTasks();
  const [newTitle, setNewTitle] = useState('');

  function handleAdd() {
    if (newTitle.trim().length === 0) return;
    addTask(newTitle.trim(), '');
    setNewTitle('');
  }

  const visibleTasks = tasks.filter((t) => !t.deleted);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>My Tasks</Text>
        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#2ecc71' : '#e74c3c' }]} />
        <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={visibleTasks}
          keyExtractor={(item) => item.client_id}
          renderItem={({ item }) => (
            <TaskItem task={item} onToggle={toggleTask} onEdit={editTask} onDelete={removeTask} />
          )}
          ListEmptyComponent={<Text style={styles.empty}>No tasks yet, add one below</Text>}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: { fontSize: 22, fontWeight: '600', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  statusText: { fontSize: 12, color: '#666' },
  loadingText: { textAlign: 'center', marginTop: 20, color: '#999' },
  empty: { textAlign: 'center', marginTop: 30, color: '#999' },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: '#3478f6',
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '600' },
});
