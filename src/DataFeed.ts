import * as sc from "socketcluster-client";
import { interval, Observable, Observer } from "rxjs";
import { map, startWith, sampleTime, tap, filter } from "rxjs/operators";

export interface IOrderBook {
  Asks: Array<[number, number, string]>;
  Bids: Array<[number, number, string]>;
  Symbol: string;
}

const sort = (ob: IOrderBook): IOrderBook => {
  return {
    Asks: ob.Asks.sort(([p1, a1, e1], [p2, a2, e2]) => p1 - p2),
    Bids: ob.Bids.sort(([p1, a1, e1], [p2, a2, e2]) => p1 - p2),
    Symbol: ob.Symbol,
  };
};

const createDataFeed = (symbol: string) =>
  Observable.create((obs: Observer<IOrderBook>) => {
    const client = sc.create({
      host: "ws-market.qa.bct.trade:443",
      secure: true,
      autoReconnect: true,
    });

    client.on("orderBook", (data: IOrderBook) => {
      obs.next(data);
    });

    client.on("connect", () => {
      console.log("MarketDataRequest", { symbols: [symbol] });
      client.emit("MarketDataRequest", { symbols: [symbol] });
    });

    return () => {
      sc.destroy(client);
    };
  }).pipe(
    sampleTime(500),
    map((x: IOrderBook) => sort(x))
  );

export default createDataFeed;
