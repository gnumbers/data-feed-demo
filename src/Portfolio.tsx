import React, { Component } from "react";

import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import createDataFeed, { IOrderBook } from "./DataFeed";
import { of, Observable, combineLatest, Unsubscribable } from "rxjs";
import { map } from "rxjs/operators";

const options = (data: any) => ({
  title: {
    text: "My stock chart",
  },
  series: [
    {
      data: data,
    },
  ],
});

const Chart: React.FunctionComponent<{ data: number[][] }> = ({ data }) => (
  <HighchartsReact
    highcharts={Highcharts}
    options={options(data)}
    constructorType={"stockChart"}
  />
);

class ChartComponent extends Component<{}, { Series: number[][] }> {
  private balance: Observable<number>;
  private subscription?: Unsubscribable;

  constructor(props: {}) {
    super(props);
    this.state = { Series: [] };
    this.balance = of(1);
  }

  public componentDidMount = () => {
    console.log("portfolio mounted");
    var balance = of(1);
    var midPrice = createDataFeed("BTC-USDT").pipe(
      map((ob: IOrderBook) => ob.MidPrice)
    );

    this.subscription = combineLatest(
      balance,
      midPrice,
      (b, p) => b * p
    ).subscribe(portfolio =>
      this.setState((s, p) => {
        const currentDate = new Date();
        return {
          ...s,
          Series: s.Series.concat([[currentDate.valueOf(), portfolio]]),
        };
      })
    );
  };

  public componentWillUnmount = () => {
    console.log("portfolio unmounted");
    if (this.subscription) this.subscription.unsubscribe();
  };

  public render() {
    return <Chart data={this.state.Series} />;
  }
}

export default ChartComponent;
