import fetch from 'node-fetch';
import cron from 'node-cron';

const tasks = {}; // URL => cron task
const logs = {};  // URL => [log entries]

export function schedulePing(url, interval) {
  if (tasks[url]) return false;

  logs[url] = logs[url] || [];

  const task = cron.schedule(`*/${interval} * * * *`, async () => {
    const timestamp = new Date().toISOString();
    try {
      const res = await fetch(url);
      const message = `[${timestamp}] ✅ Pinged - ${res.status}`;
      console.log(message);
      logs[url].push(message);
    } catch (err) {
      const errorMsg = `[${timestamp}] ❌ Failed - ${err.message}`;
      console.error(errorMsg);
      logs[url].push(errorMsg);
    }
    if (logs[url].length > 50) logs[url].shift();
  });

  tasks[url] = task;
  return true;
}

export function stopPing(url) {
  if (tasks[url]) {
    tasks[url].stop();
    delete tasks[url];
    return true;
  }
  return false;
}

export function getLogs(url) {
  return logs[url] || [];
}