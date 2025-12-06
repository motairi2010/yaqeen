class OfflineStorage {
  constructor() {
    this.dbName = 'yaqeen-offline';
    this.storeName = 'pending-requests';
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async addPendingRequest(request) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const addRequest = store.add({
        ...request,
        timestamp: Date.now(),
      });

      addRequest.onsuccess = () => resolve(addRequest.result);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  async getPendingRequests() {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const getRequest = store.getAll();

      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removePendingRequest(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  async clearPendingRequests() {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();

export const syncPendingRequests = async (syncFunction) => {
  if (!navigator.onLine) {
    return;
  }

  const pendingRequests = await offlineStorage.getPendingRequests();

  for (const request of pendingRequests) {
    try {
      await syncFunction(request);
      await offlineStorage.removePendingRequest(request.id);
    } catch (error) {
      console.error('Failed to sync request:', error);
    }
  }
};
