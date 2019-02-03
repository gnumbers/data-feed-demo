/// <reference path="highcharts-react-official.d.ts" />

import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import createDataFeed, { IOrderBook } from "./DataFeed";
import { Subscription, Observable } from "rxjs";

const OrderBookSide: React.FunctionComponent<{
  color: string;
  positions: Array<[number, number, string]>;
  size: number;
  reverse: boolean;
}> = props => {
  const items = props.reverse
    ? props.positions.slice(0, props.size).reverse()
    : props.positions.slice(0, props.size);

  return (
    <table style={{ color: props.color }}>
      <tbody>
        {items.map(([price, amount, exchanges]) => (
          <tr key={price}>
            <td>{price}</td>
            <td>{amount}</td>
            <td>{exchanges}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const chartOptions = (title: string) => {
  return {
    chart: {
      type: "area",
      zoomType: "xy",
    },
    title: {
      text: `${title} Market Depth`,
    },
    xAxis: {
      minPadding: 0,
      maxPadding: 0,
      plotLines: [
        {
          color: "#888",
          value: 0.1523,
          width: 1,
          label: {
            text: "Actual price",
            rotation: 90,
          },
        },
      ],
      title: {
        text: "Price",
      },
    },
    yAxis: [
      {
        lineWidth: 1,
        gridLineWidth: 1,
        title: null,
        tickWidth: 1,
        tickLength: 5,
        tickPosition: "inside",
        labels: {
          align: "left",
          x: 8,
        },
      },
      {
        opposite: true,
        linkedTo: 0,
        lineWidth: 1,
        gridLineWidth: 0,
        title: null,
        tickWidth: 1,
        tickLength: 5,
        tickPosition: "inside",
        labels: {
          align: "right",
          x: -8,
        },
      },
    ],
    legend: {
      enabled: false,
    },
    plotOptions: {
      area: {
        fillOpacity: 0.2,
        lineWidth: 1,
        step: "center",
      },
    },
    tooltip: {
      headerFormat:
        '<span style="font-size=10px;">Price: {point.key}</span><br/>',
      valueDecimals: 2,
    },
  };
};

interface IChartProps {
  Symbol: string;
}

function* getDepth(
  positions: Array<[number, number, string]>
): IterableIterator<[number, number]> {
  let sum = 0;
  for (var p of positions) {
    sum += p[1];
    yield [p[0], sum];
  }
}

export class Chart extends React.Component<IChartProps, IOrderBook> {
  constructor(props: IChartProps) {
    super(props);
    this.state = { Asks: [], Bids: [], Symbol: "", MidPrice: 0 };
  }

  private subscription?: Subscription;

  public componentDidMount() {
    this.subscription = createDataFeed(this.props.Symbol).subscribe(
      (d: IOrderBook) => this.setState(d)
    );
  }

  public UNSAFE_componentWillReceiveProps(newProps: IChartProps) {
    if (this.props.Symbol != newProps.Symbol) {
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = createDataFeed(newProps.Symbol).subscribe(
          (d: IOrderBook) => this.setState(d)
        );
      }
    }
  }

  public componentWillUnmount() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  public render() {
    // const asks = this.state.Asks.map(([a, p]) => [a, p]);
    // const bids = this.state.Bids.map(([a, p]) => [a, p]);

    const asksDepth = Array.from(getDepth(this.state.Asks));
    const bidsDepth = Array.from(getDepth(this.state.Bids.reverse())).reverse();

    const defaultOptions = chartOptions(this.state.Symbol);

    const options = {
      ...defaultOptions,
      series: [
        { data: asksDepth, name: "asks", color: "#fc5857" },
        //{ data: asksDepth, name: "asks-1", color: "#fc5857" },
        { data: bidsDepth, name: "bids", color: "#03a7a8" },
        //{ data: bidsDepth, name: "bids-1", color: "#03a7a8" },
      ],
    };

    return (
      <div>
        <div>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
        <div>
          <OrderBookSide
            color="red"
            positions={this.state.Asks}
            size={10}
            reverse={true}
          />
        </div>
        <div>
          <OrderBookSide
            color="green"
            positions={this.state.Bids}
            size={10}
            reverse={false}
          />
        </div>
      </div>
    );
  }
}
