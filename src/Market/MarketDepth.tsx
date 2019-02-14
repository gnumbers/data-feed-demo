/// <reference path="highcharts-react-official.d.ts" />

import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { IOrderBook } from "../DataFeed";
import { Subscription, Observable } from "rxjs";
import { sampleTime } from "rxjs/operators";

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

interface ChartProps {
  Stream: Observable<IOrderBook>;
  Throttle?: number;
}

function* getDepth(
  positions: Array<[number, number, string]>
): IterableIterator<[number, number]> {
  let sum = 0;
  for (const p of positions) {
    sum += p[1];
    yield [p[0], sum];
  }
}

export class Chart extends React.Component<ChartProps, IOrderBook> {
  constructor(props: ChartProps) {
    super(props);
    this.state = { Asks: [], Bids: [], Symbol: "", MidPrice: 0 };
  }

  private subscription?: Subscription;

  private initializeComponent = () => {
    if (this.subscription) this.subscription.unsubscribe();

    const stream = this.props.Throttle
      ? this.props.Stream.pipe(sampleTime(this.props.Throttle))
      : this.props.Stream;

    this.subscription = stream.subscribe((d: IOrderBook) => this.setState(d));
  };

  public componentDidMount() {
    this.initializeComponent();
  }

  public componentDidUpdate(prevProps: ChartProps) {
    if (prevProps.Stream === this.props.Stream) return;
    this.initializeComponent();
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
      </div>
    );
  }
}

export default Chart;
