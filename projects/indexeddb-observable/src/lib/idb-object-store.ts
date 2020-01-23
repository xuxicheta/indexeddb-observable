export function iDBObjectStore(db: IDBDatabase, mode: IDBTransactionMode, objectName ?: string): IDBObjectStore {
  return db
    .transaction(objectName || this.config.objectName, mode)
    .objectStore(this.config.objectName);
}
