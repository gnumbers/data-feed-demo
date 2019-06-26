import React from "react";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { getChart, getBreakdowns, getDonuts } from "../feed";
import { Doughnut } from "react-chartjs-2";
import { Chart } from "chart.js";

type MyProps = {
  match: { params: { symbol: string } };
};

type MyState = { tick: number; content: any };

const initial: MyState = { tick: 0, content: {} };

const transformToData = (
  update: MyState
): { labels: string[]; data: number[] } => {
  const result = {
    labels: update.content.Legs.map((x: any) => x.Exchange),
    data: update.content.Legs.map((x: any) => x.Size)
  };

  console.log(result);

  return result;
};

export default class extends React.Component<MyProps, MyState> {
  constructor(props: MyProps) {
    super(props);
    this.state = initial;
  }

  private subscription?: Subscription;

  private initializeSubscription() {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = getDonuts({
      symbol: this.props.match.params.symbol,
      throttleMs: 500,
      amount: 5,
      side: "BUY"
    })
      .pipe(map((x, ind) => ({ content: x, tick: ind })))
      .subscribe((update: MyState) =>
        this.setState({ tick: update.tick, content: transformToData(update) })
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

        <Doughnut
          options={{
            animation: {
              duration: 100
            }
          }}
          data={{
            datasets: [
              {
                data: this.state.content.data
              }
            ],
            labels: this.state.content.labels
          }}
        />
      </div>
    );
  };
}
