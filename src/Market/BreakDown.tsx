import React from "react";
import * as sc from "socketcluster-client";
import { Subscription, Observable, Observer } from "rxjs";
import { IOrderBook } from "../DataFeed";
import { map, filter, tap } from "rxjs/operators";
import { OrderBookSide } from "./OrderBook";
import { Link } from "react-router-dom";

const sort = (ob: IOrderBook): IOrderBook => {
  return {
    Asks: ob.Asks.sort(([p1, a1, e1], [p2, a2, e2]) => p1 - p2),
    Bids: ob.Bids.sort(([p1, a1, e1], [p2, a2, e2]) => p1 - p2),
    Symbol: ob.Symbol,
    ...ob
  };
};

const createDataFeed = (symbol: string): Observable<IOrderBook> => {
  return Observable.create((obs: Observer<IOrderBook>) => {
    const client = sc.create({
      host: "ws-market.bct.trade:443",
      secure: true,
      autoReconnect: true
    });

    client.on("breakdown", (data: IOrderBook) => {
      obs.next(data);
    });

    client.on("connect", () => {
      // { "breakdownRequest": { "symbols": [ "BTC-USDT" ], "levels": 100, "throttleMs": 500 } }
      const cmd = { symbols: [symbol], throttle: 50, levels: 10 };
      console.log("MarketBreakdown", cmd);
      client.emit("breakdownRequest", cmd);
    });

    return () => {
      sc.destroy(client);
    };
  }); //.pipe(map((x: IOrderBook) => sort(x)));
};

interface BreakDownProps {
  match: { params: { symbol: string } };
}

export default class BreakDown extends React.Component<
  BreakDownProps,
  { orderBook: IOrderBook }
> {
  private subscription?: Subscription;

  constructor(props: BreakDownProps) {
    super(props);
    this.state = {
      orderBook: {
        Asks: [],
        Bids: [],
        Symbol: props.match.params.symbol,
        MidPrice: 0
      }
    };
  }

  public componentWillMount = () => {
    this.initialize();
  };

  public componentDidUpdate = (prevProps: BreakDownProps) => {
    if (prevProps.match.params.symbol != this.props.match.params.symbol) {
      this.initialize();
    }
  };

  initialize = () => {
    if (this.subscription) this.subscription.unsubscribe();
    const symbol = this.props.match.params.symbol;
    this.subscription = createDataFeed(symbol).subscribe(x =>
      this.setState({ orderBook: x })
    );
  };

  public render() {
    const currencies = ["BTC-USDT", "ETH-BTC", "LTC-BTC"];

    return (
      <div>
        {currencies.map(x => (
          <Link to={`/breakdown/${x}`}>{x}</Link>
        ))}
        <OrderBookSide positions={this.state.orderBook.Asks} color="red" />
        <OrderBookSide positions={this.state.orderBook.Bids} color="green" />
      </div>
    );
  }
}
