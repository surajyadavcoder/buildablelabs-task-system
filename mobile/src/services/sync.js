import * as Network from 'expo-network';
import { getQueue, setQueue } from '../storage/localTasks';
import { syncTasksApi } from './api';

let isSyncing = false;

export async function trySync(onComplete) {
  if (isSyncing) return;

  const net = await Network.getNetworkStateAsync();
  if (!net.isConnected) return;

  const queue = await getQueue();
  if (queue.length === 0) return;

  isSyncing = true;
  try {
    const res = await syncTasksApi(queue);
    const failed = res.results
      .filter((r) => r.status === 'error')
      .map((r) => queue.find((q) => q.client_id === r.client_id))
      .filter(Boolean);
    await setQueue(failed);
    if (onComplete) onComplete(res.results);
  } catch (err) {
    console.log('sync failed, will retry later:', err.message);
  } finally {
    isSyncing = false;
  }
}

export function setupAutoSync(onComplete) {
  const interval = setInterval(async () => {
    const net = await Network.getNetworkStateAsync();
    if (net.isConnected) {
      await trySync(onComplete);
    }
  }, 5000); // har 5 second mein check karta hai

  return () => clearInterval(interval);
}