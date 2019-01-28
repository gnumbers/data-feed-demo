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
    Asks: ob.Asks.sort(x => -x[0]),
    Bids: ob.Bids.sort(x => -x[0]),
    Symbol: ob.Symbol,
  };
};

const createDataFeed = (symbol: string) =>
  Observable.create((obs: Observer<IOrderBook>) => {
    const client = sc.create({
      host: "ws-market.qa.bct.trade:443",
      autoReconnect: true,
    });

    client.on("orderBook", (data: IOrderBook) => {
      console.log(data.Symbol);
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
    map(sort)
  );

export default createDataFeed;
