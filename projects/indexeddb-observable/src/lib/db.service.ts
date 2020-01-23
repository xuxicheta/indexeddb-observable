import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap, shareReplay } from 'rxjs/operators';
import { DB_CONFIG } from './db-config';
import { DbConfig } from './db-config.interface';
import { fromIDBRequest } from './from-idb-request';
import { iDBObjectStore } from './idb-object-store';

@Injectable()
export class DbService<T = any> {
  public readonly version = this.config.version;
  public readonly name = this.config.name;
  private db$: Observable<IDBDatabase> = this.createDb(this.name, this.version);

  constructor(
    @Inject(DB_CONFIG) private config: DbConfig,
  ) { }

  private createDb(name: string, version: number): Observable<IDBDatabase> {
    const openRequest: IDBOpenDBRequest = indexedDB.open(name, version);

    openRequest.onupgradeneeded = (evt: IDBVersionChangeEvent) => this.onUpgradeNeeded(openRequest.result);

    return fromIDBRequest(openRequest).pipe(
      shareReplay(1),
    );
  }

  private onUpgradeNeeded(db: IDBDatabase): void {
    if (db.objectStoreNames.contains(this.config.objectName)) {
      return;
    }
    const params: IDBObjectStoreParameters = {};
    if ('keyPath' in this.config) {
      params.keyPath = this.config.keyPath;
    }
    if ('autoIncrement' in this.config) {
      params.autoIncrement = this.config.autoIncrement;
    }

    db.createObjectStore(this.config.objectName, params);
  }

  public add(value: T, key?: IDBValidKey): Observable<IDBValidKey> {
    return this.result((db: IDBDatabase) => fromIDBRequest(iDBObjectStore(db, 'readwrite').add(value, key)));
  }

  public put(value: T, key?: IDBValidKey): Observable<IDBValidKey> {
    return this.result((db: IDBDatabase) => fromIDBRequest(iDBObjectStore(db, 'readwrite').put(value, key)));
  }

  public delete(key: string): Observable<void> {
    return this.result(db => fromIDBRequest(iDBObjectStore(db, 'readwrite').delete(key)));
  }

  public clear(): Observable<void> {
    return this.result(db => fromIDBRequest(iDBObjectStore(db, 'readwrite').clear()));
  }

  public get(key: IDBValidKey|IDBKeyRange): Observable<T|T[]> {
    return this.result(db => fromIDBRequest(iDBObjectStore(db, 'readonly').get(key)));
  }

  public getAll(): Observable<T[]> {
    return this.result(db => fromIDBRequest(iDBObjectStore(db, 'readonly').getAll()));
  }

  public count(key?: IDBValidKey | IDBKeyRange) {
    return this.result(db => fromIDBRequest(iDBObjectStore(db, 'readonly').count(key)));
  }


  private result<R>(requestGainer: (db: IDBDatabase) => Observable<R>) {
    return this.db$.pipe(
      mergeMap(requestGainer),
    );
  }

  public selectDb() {
    return this.db$;
  }

  public selectObjectStore(mode: IDBTransactionMode): Observable<IDBObjectStore> {
    return this.db$.pipe(
      map(db => iDBObjectStore(db, mode))
    );
  }
}
