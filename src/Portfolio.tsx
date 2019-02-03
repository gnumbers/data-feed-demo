import React, { Component } from "react";

import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import createDataFeed, { IOrderBook } from "./DataFeed";
import {
  of,
  Observable,
  combineLatest,
  Unsubscribable,
  interval,
  Subject,
  never,
  Subscription,
  ReplaySubject,
  BehaviorSubject,
} from "rxjs";
import {
  map,
  share,
  bufferTime,
  flatMap,
  tap,
  take,
  skip,
  filter,
  mergeAll,
  distinctUntilChanged,
  switchMap,
  sampleTime,
  scan,
  startWith,
  mergeMap,
} from "rxjs/operators";
import { EEXIST } from "constants";

const options = (data: any, actual: any) => ({
  title: {
    text: "Portfolio: 1 BTC",
  },
  rangeSelector: {
    inputEnabled: false,
    selected: 4,
    buttons: [
      {
        type: "minute",
        count: 1,
        text: "1m",
      },
      {
        type: "minute",
        count: 5,
        text: "5m",
      },
      {
        type: "hour",
        count: 1,
        text: "1h",
      },
      {
        type: "all",
        text: "All",
      },
    ],
  },
  series: [
    {
      name: "generated",
      data: data,
    },
    {
      name: "actual",
      data: actual,
    },
  ],
});

const Chart: React.FunctionComponent<{
  data: number[][];
  actual: number[][];
}> = ({ data, actual }) => (
  <HighchartsReact
    highcharts={Highcharts}
    options={options(data, actual)}
    constructorType={"stockChart"}
  />
);

interface IRate {
  when: Date;
  price: number;
}

const changeRandomly = (val: number): number => {
  var changePercent = Math.random() * 0.008 - 0.004;

  return val * (1 + changePercent / 100);
};

class ChartComponent extends Component<
  {},
  { Series: number[][]; Actual: number[][]; Noise: boolean }
> {
  private balance: Observable<number>;
  private subscription?: Subscription;
  private controlsSubscription = never().subscribe();
  private noiseSubject = new BehaviorSubject<boolean>(false);

  private generateNoise = (val: IRate): Observable<IRate> => {
    return combineLatest(
      interval(1000).pipe(startWith(0)),
      this.noiseSubject,
      (_, n) => n
    ).pipe(
      scan((acc: IRate, noise: boolean, index: number) => {
        var newPrice = noise ? changeRandomly(acc.price) : acc.price;
        return {
          when: new Date(val.when.valueOf() + 1000 * index),
          price: newPrice,
        };
      }, val)
    );
  };

  constructor(props: {}) {
    super(props);
    this.state = { Series: [], Actual: [], Noise: false };
    this.balance = of(1);
  }

  private watchNoiseCheckBox = () => {
    this.controlsSubscription.add(
      this.noiseSubject
        // .pipe(startWith(false))
        .subscribe(x => this.setState({ Noise: x }))
    );
  };

  public componentDidMount = () => {
    this.watchNoiseCheckBox();

    console.log("portfolio mounted");
    var balance = of(1);
    var midPrice: Observable<IRate> = createDataFeed("BTC-USDT")
      .pipe(
        map(x => x.MidPrice),
        distinctUntilChanged(),
        tap(x => console.log(`New midprice: ${x}`))
      )
      .pipe(
        map(midPrice => {
          return { when: new Date(), price: midPrice };
        })
      );

    const serverPortfolio: Observable<IRate> = combineLatest(
      balance,
      midPrice,
      (b, rate) => {
        return {
          when: rate.when,
          price: b * rate.price,
        };
      }
    ).pipe(share());

    const withNoise = serverPortfolio.pipe(
      sampleTime(5),
      switchMap(this.generateNoise)
    );

    this.subscription = withNoise
      .pipe(map(x => [x.when.valueOf(), x.price]))
      .subscribe(portfolio =>
        this.setState((s, p) => {
          return {
            ...s,
            Series: s.Series.concat([portfolio]),
          };
        })
      );

    this.subscription.add(
      serverPortfolio
        .pipe(
          switchMap(x =>
            interval(10000).pipe(
              startWith(0),
              map(_ => {
                return { ...x, when: new Date() };
              })
            )
          )
        )
        .subscribe(x =>
          this.setState((s, p) => {
            return {
              ...s,
              Actual: s.Actual.concat([[x.when.valueOf(), x.price]]),
            };
          })
        )
    );
  };

  public componentWillUnmount = () => {
    console.log("portfolio unmounted");
    if (this.subscription) this.subscription.unsubscribe();
  };

  private handleNoiseChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.noiseSubject.next(ev.target.checked);
  };

  public render() {
    return (
      <div>
        <div>
          <label htmlFor="noise">
            <span>
              <input
                type="checkbox"
                checked={this.state.Noise}
                id="noise"
                onChange={this.handleNoiseChanged}
              />
              Generate noise
            </span>
          </label>
        </div>
        <Chart data={this.state.Series} actual={this.state.Actual} />
      </div>
    );
  }
}

export default ChartComponent;
