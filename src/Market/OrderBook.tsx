import React from "react";
import { Observable, Unsubscribable } from "rxjs";
import { IOrderBook } from "../DataFeed";
import { sampleTime, map } from "rxjs/operators";

interface OrderBookProps {
  Stream: Observable<IOrderBook>;
  Depth: number;
  Throttle?: number;
}

function truncate(orderBook: IOrderBook, depth: number): IOrderBook {
  const asks = orderBook.Asks.slice(0, depth).reverse();

  const bidsCount = orderBook.Bids.length;
  const bids = orderBook.Bids.slice(
    Math.max(0, bidsCount - depth),
    bidsCount - 1
  ).reverse();

  return {
    Symbol: orderBook.Symbol,
    MidPrice: orderBook.MidPrice,
    Asks: asks,
    Bids: bids
  };
}

export const OrderBookSide: React.FunctionComponent<{
  positions: [number, number, string][];
  color: string;
}> = ({ positions, color }) => {
  return (
    <table style={{ color: color }}>
      <tbody>
        {positions.map(([price, amount, exchanges]) => (
          <tr key={price}>
            <td style={{ width: "120px" }}>{price}</td>
            <td style={{ width: "120px" }}>{amount}</td>
            <td>{exchanges}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

class Component extends React.Component<
  OrderBookProps,
  { orderBook: IOrderBook }
> {
  private subscription?: Unsubscribable;

  constructor(props: OrderBookProps) {
    super(props);
    this.state = { orderBook: { Asks: [], Bids: [], MidPrice: 0, Symbol: "" } };
  }

  private initializeComponent() {
    if (this.subscription) this.subscription.unsubscribe();
    const stream = this.props.Throttle
      ? this.props.Stream.pipe(sampleTime(this.props.Throttle))
      : this.props.Stream;
    this.subscription = stream
      .pipe(map(x => truncate(x, this.props.Depth)))
      .subscribe(x => this.setState({ orderBook: x }));
  }

  public componentDidMount = () => {
    this.initializeComponent();
  };

  public componentDidUpdate = (prevProps: OrderBookProps) => {
    if (
      prevProps.Stream === this.props.Stream &&
      prevProps.Depth === this.props.Depth &&
      prevProps.Throttle === this.props.Throttle
    ) {
      return;
    } else {
      this.initializeComponent();
    }
  };

  public componentWillUnmount = () => {
    if (this.subscription) this.subscription.unsubscribe();
  };

  public render = () => (
    <div>
      <div>
        <OrderBookSide color="red" positions={this.state.orderBook.Asks} />
      </div>
      <div>
        <OrderBookSide color="green" positions={this.state.orderBook.Bids} />
      </div>
    </div>
  );
}

export default Component;
