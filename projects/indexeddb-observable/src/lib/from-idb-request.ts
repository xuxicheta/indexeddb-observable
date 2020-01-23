import { Observable } from 'rxjs';

export function fromIDBRequest<T>(idbRequest: IDBRequest<T>): Observable<T> {
  return new Observable<T>(observer => {
    idbRequest.onsuccess = (evt: Event) => {
      observer.next(idbRequest.result);
      observer.complete();
      // evt.stopPropagation();
    };
    idbRequest.onerror = (evt: Event) => {
      observer.error(idbRequest.error);
      // evt.stopPropagation();
    };
  });
}
