/**
 * Offline Storage Service using IndexedDB
 * Provides persistent local storage for prescriptions, reminders, and offline sync
 */

import { openDB } from 'idb';

const DB_NAME = 'prescripto-offline';
const DB_VERSION = 1;

// Store names
const STORES = {
  PRESCRIPTIONS: 'prescriptions',
  REMINDERS: 'reminders',
  SYNC_QUEUE: 'syncQueue',
  USER_DATA: 'userData',
  SETTINGS: 'settings'
};

let dbPromise = null;

/**
 * Initialize the IndexedDB database
 */
const initDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Prescriptions store
      if (!db.objectStoreNames.contains(STORES.PRESCRIPTIONS)) {
        const prescriptionStore = db.createObjectStore(STORES.PRESCRIPTIONS, {
          keyPath: '_id'
        });
        prescriptionStore.createIndex('userId', 'userId', { unique: false });
        prescriptionStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Reminders store
      if (!db.objectStoreNames.contains(STORES.REMINDERS)) {
        const reminderStore = db.createObjectStore(STORES.REMINDERS, {
          keyPath: '_id'
        });
        reminderStore.createIndex('userId', 'userId', { unique: false });
        reminderStore.createIndex('nextDue', 'nextDue', { unique: false });
      }

      // Sync queue for offline actions
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true
        });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
      }

      // User data store
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    }
  });

  return dbPromise;
};

// ============ Prescription Operations ============

/**
 * Save a prescription to local storage
 */
export const savePrescription = async (prescription) => {
  const db = await initDB();
  const tx = db.transaction(STORES.PRESCRIPTIONS, 'readwrite');
  await tx.store.put({
    ...prescription,
    _cachedAt: new Date().toISOString()
  });
  await tx.done;
};

/**
 * Save multiple prescriptions
 */
export const savePrescriptions = async (prescriptions) => {
  const db = await initDB();
  const tx = db.transaction(STORES.PRESCRIPTIONS, 'readwrite');
  for (const prescription of prescriptions) {
    await tx.store.put({
      ...prescription,
      _cachedAt: new Date().toISOString()
    });
  }
  await tx.done;
};

/**
 * Get a prescription by ID
 */
export const getPrescription = async (id) => {
  const db = await initDB();
  return db.get(STORES.PRESCRIPTIONS, id);
};

/**
 * Get all cached prescriptions
 */
export const getAllPrescriptions = async () => {
  const db = await initDB();
  return db.getAll(STORES.PRESCRIPTIONS);
};

/**
 * Get prescriptions by user ID
 */
export const getPrescriptionsByUser = async (userId) => {
  const db = await initDB();
  const index = db.transaction(STORES.PRESCRIPTIONS).store.index('userId');
  return index.getAll(userId);
};

/**
 * Delete a prescription from local storage
 */
export const deletePrescription = async (id) => {
  const db = await initDB();
  await db.delete(STORES.PRESCRIPTIONS, id);
};

/**
 * Clear all prescriptions
 */
export const clearPrescriptions = async () => {
  const db = await initDB();
  await db.clear(STORES.PRESCRIPTIONS);
};

// ============ Reminder Operations ============

/**
 * Save a reminder to local storage
 */
export const saveReminder = async (reminder) => {
  const db = await initDB();
  await db.put(STORES.REMINDERS, {
    ...reminder,
    _cachedAt: new Date().toISOString()
  });
};

/**
 * Save multiple reminders
 */
export const saveReminders = async (reminders) => {
  const db = await initDB();
  const tx = db.transaction(STORES.REMINDERS, 'readwrite');
  for (const reminder of reminders) {
    await tx.store.put({
      ...reminder,
      _cachedAt: new Date().toISOString()
    });
  }
  await tx.done;
};

/**
 * Get all cached reminders
 */
export const getAllReminders = async () => {
  const db = await initDB();
  return db.getAll(STORES.REMINDERS);
};

/**
 * Get reminders due soon
 */
export const getDueReminders = async () => {
  const db = await initDB();
  const all = await db.getAll(STORES.REMINDERS);
  const now = new Date();
  return all.filter(r => r.isActive && new Date(r.nextDue) <= now);
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (id) => {
  const db = await initDB();
  await db.delete(STORES.REMINDERS, id);
};

// ============ Sync Queue Operations ============

/**
 * Add an action to the sync queue (for offline operations)
 */
export const addToSyncQueue = async (action) => {
  const db = await initDB();
  await db.add(STORES.SYNC_QUEUE, {
    ...action,
    timestamp: new Date().toISOString(),
    retries: 0
  });
};

/**
 * Get all pending sync actions
 */
export const getPendingSyncActions = async () => {
  const db = await initDB();
  return db.getAll(STORES.SYNC_QUEUE);
};

/**
 * Remove a sync action after successful sync
 */
export const removeSyncAction = async (id) => {
  const db = await initDB();
  await db.delete(STORES.SYNC_QUEUE, id);
};

/**
 * Clear all sync actions
 */
export const clearSyncQueue = async () => {
  const db = await initDB();
  await db.clear(STORES.SYNC_QUEUE);
};

/**
 * Process sync queue when online
 */
export const processSyncQueue = async (apiHandler) => {
  const actions = await getPendingSyncActions();
  const results = [];

  for (const action of actions) {
    try {
      await apiHandler(action);
      await removeSyncAction(action.id);
      results.push({ id: action.id, success: true });
    } catch (error) {
      console.error('Sync failed for action:', action, error);
      results.push({ id: action.id, success: false, error: error.message });
    }
  }

  return results;
};

// ============ User Data Operations ============

/**
 * Save user data for offline access
 */
export const saveUserData = async (key, data) => {
  const db = await initDB();
  await db.put(STORES.USER_DATA, { key, data, updatedAt: new Date().toISOString() });
};

/**
 * Get user data
 */
export const getUserData = async (key) => {
  const db = await initDB();
  const result = await db.get(STORES.USER_DATA, key);
  return result?.data;
};

// ============ Settings Operations ============

/**
 * Save a setting
 */
export const saveSetting = async (key, value) => {
  const db = await initDB();
  await db.put(STORES.SETTINGS, { key, value });
};

/**
 * Get a setting
 */
export const getSetting = async (key) => {
  const db = await initDB();
  const result = await db.get(STORES.SETTINGS, key);
  return result?.value;
};

// ============ Online/Offline Status ============

/**
 * Check if online
 */
export const isOnline = () => navigator.onLine;

/**
 * Check if offline
 */
export const isOffline = () => !navigator.onLine;

/**
 * Add online/offline event listeners
 */
export const addConnectionListener = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// ============ Storage Stats ============

/**
 * Get storage statistics
 */
export const getStorageStats = async () => {
  const db = await initDB();
  
  const prescriptionCount = await db.count(STORES.PRESCRIPTIONS);
  const reminderCount = await db.count(STORES.REMINDERS);
  const syncQueueCount = await db.count(STORES.SYNC_QUEUE);

  let storageEstimate = null;
  if (navigator.storage && navigator.storage.estimate) {
    storageEstimate = await navigator.storage.estimate();
  }

  return {
    prescriptionCount,
    reminderCount,
    syncQueueCount,
    storage: storageEstimate
  };
};

/**
 * Clear all offline data
 */
export const clearAllData = async () => {
  const db = await initDB();
  await db.clear(STORES.PRESCRIPTIONS);
  await db.clear(STORES.REMINDERS);
  await db.clear(STORES.SYNC_QUEUE);
  await db.clear(STORES.USER_DATA);
};

export default {
  // Prescriptions
  savePrescription,
  savePrescriptions,
  getPrescription,
  getAllPrescriptions,
  getPrescriptionsByUser,
  deletePrescription,
  clearPrescriptions,
  
  // Reminders
  saveReminder,
  saveReminders,
  getAllReminders,
  getDueReminders,
  deleteReminder,
  
  // Sync
  addToSyncQueue,
  getPendingSyncActions,
  removeSyncAction,
  clearSyncQueue,
  processSyncQueue,
  
  // User Data
  saveUserData,
  getUserData,
  
  // Settings
  saveSetting,
  getSetting,
  
  // Status
  isOnline,
  isOffline,
  addConnectionListener,
  
  // Stats
  getStorageStats,
  clearAllData
};
