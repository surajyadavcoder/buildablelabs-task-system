const supabase = require('../config/supabaseClient');

// GET /tasks - fetch all non-deleted tasks
async function getTasks(req, res) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('deleted', false)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// POST /tasks - create a new task
async function createTask(req, res) {
  const { title, description, client_id } = req.body;

  if (!title) return res.status(400).json({ error: 'title is required' });

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title, description, client_id }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
}

// PUT /tasks/:id - update a task
async function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, is_done } = req.body;

  const { data, error } = await supabase
    .from('tasks')
    .update({ title, description, is_done })
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Task not found' });
  res.json(data[0]);
}

// DELETE /tasks/:id - soft delete a task
async function deleteTask(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('tasks')
    .update({ deleted: true })
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true });
}

// POST /tasks/sync - batch sync for offline queued changes
// Conflict strategy: Last-Write-Wins based on updated_at timestamp
async function syncTasks(req, res) {
  const { changes } = req.body; // array of { client_id, title, description, is_done, updated_at, deleted, op }

  if (!Array.isArray(changes)) {
    return res.status(400).json({ error: 'changes must be an array' });
  }

  const results = [];

  for (const change of changes) {
    const { client_id, title, description, is_done, deleted, op } = change;

    if (op === 'create') {
      // Idempotency: skip if a task with this client_id already exists
      const { data: existing } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', client_id)
        .maybeSingle();

      if (existing) {
        results.push({ client_id, status: 'already_exists', server_task: existing });
        continue;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title, description, client_id }])
        .select();

      if (error) {
        results.push({ client_id, status: 'error', error: error.message });
      } else {
        results.push({ client_id, status: 'created', server_task: data[0] });
      }
    } else if (op === 'update' || op === 'delete') {
      const { data: existing } = await supabase
        .from('tasks')
        .select('*')
        .eq('client_id', client_id)
        .maybeSingle();

      if (!existing) {
        results.push({ client_id, status: 'not_found' });
        continue;
      }

      // Last-Write-Wins: only apply if incoming change is newer than server's last update
      const incomingTime = new Date(change.updated_at).getTime();
      const serverTime = new Date(existing.updated_at).getTime();

      if (incomingTime < serverTime) {
        results.push({ client_id, status: 'conflict_server_wins', server_task: existing });
        continue;
      }

      const updatePayload =
        op === 'delete'
          ? { deleted: true }
          : { title, description, is_done };

      const { data, error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('client_id', client_id)
        .select();

      if (error) {
        results.push({ client_id, status: 'error', error: error.message });
      } else {
        results.push({ client_id, status: 'synced', server_task: data[0] });
      }
    }
  }

  res.json({ results });
}

module.exports = { getTasks, createTask, updateTask, deleteTask, syncTasks };
