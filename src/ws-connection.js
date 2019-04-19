import { Observable } from "rxjs";
import {
  publishReplay,
  refCount,
  retry,
  repeat,
  tap,
  publish
} from "rxjs/operators";

const createConnection = url => {
  return Observable.create(obs => {
    const ws = new WebSocket(url);

    ws.addEventListener("close", () => {
      obs.next(null);
      obs.complete();
    });

    const messages = Observable.create(obsM => {
      const handler = m => obsM.next(JSON.parse(m.data));

      ws.addEventListener("message", handler);
      return () => {
        ws.removeEventListener("message", handler);
      };
    }).pipe(
      publish(),
      refCount()
    );

    ws.addEventListener("open", () => obs.next({ ws, messages }));

    return () => {
      ws.close();
    };
  }).pipe(
    tap(null, console.warn),
    // retry if there is an error
    retry(),
    // repeat if connection closed intentionally (without errors)
    repeat(),
    // remember last connection
    publishReplay(1),
    // calculate subscriptions count and close subscription when latest consumer unsubscribed
    refCount()
  );
};

const cache = {};

export const getConnection = url => {
  if (!cache[url]) {
    cache[url] = createConnection(url);
  }
  return cache[url];
};
