// change this to your backend url before running
// if testing on a real phone, localhost won't work, use your machine's LAN ip
const BASE_URL = 'http://10.161.201.175:4000';

export async function fetchTasks() {
  const res = await fetch(`${BASE_URL}/tasks`);
  if (!res.ok) throw new Error('failed to fetch tasks');
  return res.json();
}

export async function createTaskApi(task) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('failed to create task');
  return res.json();
}

export async function updateTaskApi(id, updates) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('failed to update task');
  return res.json();
}

export async function deleteTaskApi(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('failed to delete task');
  return res.json();
}

export async function syncTasksApi(changes) {
  const res = await fetch(`${BASE_URL}/tasks/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ changes }),
  });
  if (!res.ok) throw new Error('sync failed');
  return res.json();
}
