# Cross-Platform Task System

Built Phase 1 (Mobile + Backend) and Phase 2 (Offline Support). Skipped Phase 3 (n8n) to go deeper on the first two instead of spreading thin across all three.

## Stack
- Mobile: React Native + Expo
- Backend: Node.js + Express
- DB: Supabase (Postgres)
- Local storage on device: AsyncStorage

## How it works

### Phase 1
Standard CRUD. Mobile app talks to Express backend, backend talks to Supabase. Nothing fancy here, just wanted this part to be solid since everything else depends on it.

### Phase 2 - Offline support
This was the main thing I spent time thinking through.

**The problem:** if you create/edit/delete a task while offline, that change needs to get to the server eventually, without losing data and without creating duplicates.

**My approach:**
- Every task gets a `client_id` (UUID) generated on the device the moment it's created, not waiting for the server to give it an id. This means the task can be added to the UI instantly even with zero internet.
- Any change (create/update/delete) gets pushed into a local queue stored in AsyncStorage.
- A NetInfo listener watches connectivity. The moment internet comes back, it tries to flush the queue to a `/tasks/sync` endpoint on the backend.
- The sync endpoint processes each queued change one at a time and uses `client_id` to check if that task already exists on the server. This makes creates idempotent — if the same create somehow gets sent twice (e.g. app crashed mid-sync), it won't create a duplicate.

**Conflict resolution:** I went with Last-Write-Wins, using the `updated_at` timestamp. If two devices edited the same task while both were offline, whichever change has the more recent timestamp wins when it reaches the server. The other one gets dropped (in the response it shows up as `conflict_server_wins`).

I considered field-level merging (e.g. keep both the title change AND the is_done change if they came from different edits) but decided against it for the time I had — LWW is simpler to reason about and is honestly what most apps do in practice (e.g. Notion, Google Docs do something fancier with CRDTs, but that's a much bigger scope than 48 hours).

**What I didn't handle:** if the same field is conflicted, you silently lose one side. A more complete version would show the user "this task was also edited elsewhere, pick which version to keep." Didn't have time to build that UI.

### Why I skipped Phase 3
n8n was new to me and I'd rather submit two phases that actually work well than three where one is half-broken. Happy to talk through how I'd approach the n8n automation in the interview though.

## Running it

### Backend
```
cd backend
npm install
cp .env.example .env   # fill in your Supabase URL + key
npm run dev
```

Run the SQL in `backend/src/db/schema.sql` inside your Supabase project's SQL editor first.

### Mobile
```
cd mobile
npm install
```
Before running, update `BASE_URL` in `mobile/src/services/api.js` to your machine's local IP (not localhost, since the app runs on a separate device/simulator).

```
npx expo start
```

## Testing offline mode
Easiest way: turn on airplane mode on your phone/simulator, add a few tasks, turn it back off, watch them sync. You can also kill the dev server to simulate backend being down.
