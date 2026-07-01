import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'local_tasks';
const QUEUE_KEY = 'pending_changes';

// tasks cached locally so app works without internet
export async function getLocalTasks() {
  const raw = await AsyncStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveLocalTasks(tasks) {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// queue of changes made while offline (or even while online, doesn't hurt)
// each item: { client_id, op: 'create'|'update'|'delete', title, description, is_done, updated_at }
export async function getQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addToQueue(change) {
  const queue = await getQueue();
  queue.push(change);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function clearQueue() {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([]));
}

export async function setQueue(queue) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}
