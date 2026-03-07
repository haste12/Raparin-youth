import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'activities.json');
const KV_KEY = 'raparin:activities';

// Use Upstash Redis when the env vars are present (Vercel production).
// Falls back to the local JSON file for local development.
const USE_REDIS = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

async function getRedis() {
  const { Redis } = await import('@upstash/redis');
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function readActivities() {
  if (USE_REDIS) {
    try {
      const redis = await getRedis();
      const data = await redis.get(KV_KEY);
      if (data) return data;

      // First deploy: KV is empty — seed it from the bundled JSON file.
      const seeded = readFromFile();
      await redis.set(KV_KEY, seeded);
      return seeded;
    } catch (err) {
      console.error('[activities] Redis error, falling back to file:', err);
    }
  }
  return readFromFile();
}

function readFromFile() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { activities: [] };
  }
}

export async function writeActivities(data) {
  if (USE_REDIS) {
    const redis = await getRedis();
    await redis.set(KV_KEY, data);
    return;
  }
  // Local dev: persist to the JSON file as before.
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getActivityById(id) {
  const data = await readActivities();
  return data.activities.find((a) => a.id === String(id)) || null;
}
