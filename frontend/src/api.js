import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Jobs API
export const getJobs = async (status = '', search = '') => {
  const params = {};
  if (status && status !== 'all') params.status = status;
  if (search) params.search = search;
  const res = await api.get('/jobs/', { params });
  return res.data;
};

export const createJob = async (jobData, notify = true) => {
  const res = await api.post('/jobs/', jobData, { params: { notify } });
  return res.data;
};

export const markApplied = async (jobId) => {
  const res = await api.patch(`/jobs/${jobId}/apply`);
  return res.data;
};

export const deleteJob = async (jobId) => {
  const res = await api.delete(`/jobs/${jobId}`);
  return res.data;
};

// Notifications API
export const getVapidPublicKey = async () => {
  const res = await api.get('/notifications/vapid-public-key');
  return res.data.publicKey;
};

export const sendPushSubscription = async (subscription) => {
  const res = await api.post('/notifications/subscribe', subscription.toJSON ? subscription.toJSON() : subscription);
  return res.data;
};

export const sendTestPush = async () => {
  const res = await api.post('/notifications/test');
  return res.data;
};

export const triggerDeadlineCheck = async () => {
  const res = await api.post('/notifications/trigger-check');
  return res.data;
};

export const getNotificationLogs = async () => {
  const res = await api.get('/notifications/logs');
  return res.data;
};

// Push setup helper
export const registerAndSubscribePush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  // 1. Register service worker
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  // 2. Request Notification Permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was denied.');
  }

  // 3. Fetch VAPID key
  const publicKey = await getVapidPublicKey();
  const convertedVapidKey = urlBase64ToUint8Array(publicKey);

  // 4. Subscribe to PushManager
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }

  // 5. Send to backend
  await sendPushSubscription(subscription);

  return subscription;
};
