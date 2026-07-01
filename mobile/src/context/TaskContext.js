import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Crypto from 'expo-crypto';
import * as Network from 'expo-network';

import { getLocalTasks, saveLocalTasks, addToQueue } from '../storage/localTasks';
import { fetchTasks } from '../services/api';
import { trySync, setupAutoSync } from '../services/sync';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
    const unsubscribeNet = setupAutoSync(refreshFromServer);
    checkOnlineStatus();

    return () => {
      unsubscribeNet();
    };
  }, []);

  async function checkOnlineStatus() {
    const net = await Network.getNetworkStateAsync();
    setIsOnline(net.isConnected);
  }

  async function init() {
    const cached = await getLocalTasks();
    setTasks(cached);
    setLoading(false);

    await trySync();
    await refreshFromServer();
  }

  async function refreshFromServer() {
    try {
      const net = await Network.getNetworkStateAsync();
      if (!net.isConnected) return;

      setIsOnline(true);
      const serverTasks = await fetchTasks();
      setTasks(serverTasks);
      await saveLocalTasks(serverTasks);
    } catch (err) {
      setIsOnline(false);
      console.log('could not refresh from server:', err.message);
    }
  }

  async function addTask(title, description) {
    const client_id = Crypto.randomUUID();
    const newTask = {
      id: client_id,
      client_id,
      title,
      description: description || '',
      is_done: false,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      deleted: false,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    await saveLocalTasks(updated);

    await addToQueue({ ...newTask, op: 'create' });
    trySync(refreshFromServer);
  }

  async function toggleTask(client_id) {
    const updated = tasks.map((t) =>
      t.client_id === client_id
        ? { ...t, is_done: !t.is_done, updated_at: new Date().toISOString() }
        : t
    );
    setTasks(updated);
    await saveLocalTasks(updated);

    const changedTask = updated.find((t) => t.client_id === client_id);
    await addToQueue({ ...changedTask, op: 'update' });
    trySync(refreshFromServer);
  }

  async function editTask(client_id, title, description) {
    const updated = tasks.map((t) =>
      t.client_id === client_id
        ? { ...t, title, description, updated_at: new Date().toISOString() }
        : t
    );
    setTasks(updated);
    await saveLocalTasks(updated);

    const changedTask = updated.find((t) => t.client_id === client_id);
    await addToQueue({ ...changedTask, op: 'update' });
    trySync(refreshFromServer);
  }

  async function removeTask(client_id) {
    const updated = tasks.filter((t) => t.client_id !== client_id);
    setTasks(updated);
    await saveLocalTasks(updated);

    await addToQueue({ client_id, op: 'delete', updated_at: new Date().toISOString() });
    trySync(refreshFromServer);
  }

  return (
    <TaskContext.Provider
      value={{ tasks, isOnline, loading, addTask, toggleTask, editTask, removeTask }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}