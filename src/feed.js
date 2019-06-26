import { getConnection } from "./ws-connection";
import { switchMap, filter, map, tap, retry, finalize } from "rxjs/operators";
import { never } from "rxjs";

const changeBehavior = (cmd, kind, unsubscribe) => connection => {
  if (!connection) return never();

  console.log(cmd);
  connection.ws.send(JSON.stringify(cmd));

  return connection.messages.pipe(
    filter(x => x.event === kind),
    map(x => x.data),
    finalize(() => {
      try {
        connection.ws.send(JSON.stringify(unsubscribe));
      } catch (err) {
        console.warn(err);
      }
    })
  );
};

const url = "wss://market-data.bct.trade/ws";

export const getBreakdowns = ({ symbol, levels, throttleMs, exchanges }) => {
  return getConnection(url).pipe(
    switchMap(
      changeBehavior(
        {
          breakdownRequest: { symbols: [symbol], levels, throttleMs, exchanges }
        },
        "breakdown",
        { breakdownUnsubscribe: {} }
      )
    ),
    tap(null, console.warn),
    retry()
  );
};

export const getDonuts = ({ symbol, amount, side, throttleMs }) => {
  return getConnection(url).pipe(
    switchMap(
      changeBehavior(
        {
          donutSubscribe: { market: symbol, amount, side, throttleMs }
        },
        "donut",
        { donutUnsubscribe: {} }
      )
    ),
    tap(null, console.warn),
    retry()
  );
}

export const getChart = ({
  symbol,
  levels,
  throttleMs,
  min,
  max,
  exchanges
}) => {
  return getConnection(url).pipe(
    switchMap(
      changeBehavior(
        {
          marketDataRequest: {
            symbols: [symbol],
            levels,
            throttleMs,
            min,
            max,
            exchanges
          }
        },
        "orderBook",
        { marketDataUnsubscribe: {} }
      )
    ),
    tap(null, console.warn),
    retry()
  );
};
