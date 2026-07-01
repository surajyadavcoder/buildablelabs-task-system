import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  function saveEdit() {
    if (title.trim().length === 0) return;
    onEdit(task.client_id, title, task.description);
    setEditing(false);
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={() => onToggle(task.client_id)} style={styles.checkbox}>
        <Text>{task.is_done ? '✅' : '⬜'}</Text>
      </TouchableOpacity>

      {editing ? (
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={saveEdit}
          onBlur={saveEdit}
          autoFocus
        />
      ) : (
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setEditing(true)}>
          <Text style={[styles.title, task.is_done && styles.doneText]}>{task.title}</Text>
          {task.description ? <Text style={styles.desc}>{task.description}</Text> : null}
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => onDelete(task.client_id)}>
        <Text style={styles.delete}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: { marginRight: 10 },
  title: { fontSize: 16, color: '#222' },
  doneText: { textDecorationLine: 'line-through', color: '#999' },
  desc: { fontSize: 12, color: '#777', marginTop: 2 },
  input: { flex: 1, fontSize: 16, borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 2 },
  delete: { marginLeft: 10, fontSize: 16 },
});
