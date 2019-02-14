import React from "react";
import createDataFeed from "../DataFeed";
import MarketDepth from "./MarketDepth";
import OrderBook from "./OrderBook";
import { Link } from "react-router-dom";
import Loader from "./Loader";

export default (props: { match: { params: { symbol: string } } }) => {
  const symbol = props.match.params.symbol || "BTC-USDT";
  const dataSource = createDataFeed(symbol);

  const currencies = ["BTC-USDT", "ETH-BTC", "LTC-BTC"];

  return (
    <div>
      <div>
        {currencies.map(x => (
          <span key={x}>
            <Link to={`/market/${x}`}>{x}</Link> &nbsp;
          </span>
        ))}
      </div>
      <h1>{props.match.params.symbol}</h1>
      <MarketDepth Stream={dataSource} Throttle={1000} />
      <Loader Stream={dataSource} Size={20} />
      <OrderBook Stream={dataSource} Depth={10} />
    </div>
  );
};
