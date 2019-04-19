import React from "react";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { getChart, getBreakdowns } from "../feed";

type MyProps = {
  match: { params: { symbol: string } };
};

type MyState = { tick: number; content: any };

const initial: MyState = { tick: 0, content: {} };

export default class extends React.Component<MyProps, MyState> {
  constructor(props: MyProps) {
    super(props);
    this.state = initial;
  }

  private subscription?: Subscription;

  private initializeSubscription() {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = getChart({
      symbol: "BTC-USDT",
      levels: 300,
      throttleMs: 500,
      min: null,
      max: null,
      exchanges: []
    })
      .pipe(map((x, ind) => ({ content: x, tick: ind })))
      .subscribe((update: MyState) =>
        this.setState({ tick: update.tick, content: update.content })
      );

    if (this.subscription)
      this.subscription.add(
        getBreakdowns({
          symbol: "BTC-USDT",
          levels: 20,
          throttleMs: 100,
          exchanges: []
        }).subscribe()
      );
  }

  public componentWillMount = () => {
    this.initializeSubscription();
  };

  public componentDidUpdate = (prevProps: MyProps) => {
    if (prevProps.match.params.symbol !== this.props.match.params.symbol) {
      this.initializeSubscription();
    }
  };

  public componentWillUnmount = () => {
    if (this.subscription) this.subscription.unsubscribe();
  };

  public render = () => {
    return (
      <div>
        <h1>Sandbox for {this.props.match.params.symbol}</h1>
        <div>Tick: {this.state.tick}</div>
        <pre>OrderBook: {JSON.stringify(this.state.content)}</pre>
      </div>
    );
  };
}
