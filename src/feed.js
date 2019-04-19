import { getConnection } from "./ws-connection";
import { switchMap, filter, map, tap, retry } from "rxjs/operators";
import { never } from "rxjs";

const changeBehavior = (cmd, kind) => connection => {
  if (!connection) return never();

  connection.ws.send(JSON.stringify(cmd));

  return connection.messages.pipe(
    filter(x => x.event === kind),
    map(x => x.data)
  );
};

const url = "wss://market-data.bct.trade:443/ws";

export const getBreakdowns = ({ symbol, levels, throttleMs, exchanges }) => {
  return getConnection(url).pipe(
    switchMap(
      changeBehavior(
        {
          breakdownRequest: { symbols: [symbol], levels, throttleMs, exchanges }
        },
        "breakdown"
      )
    ),
    tap(null, console.warn),
    retry()
  );
};

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
        "orderBook"
      )
    ),
    tap(null, console.warn),
    retry()
  );
};
