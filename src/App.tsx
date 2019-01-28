import React, { Component } from "react";
import { Chart } from "./MarketDepth";
import createDataFeed, { IOrderBook } from "./DataFeed";

import { filter, sampleTime, share, map } from "rxjs/operators";

class App extends Component<{}, { Symbol: string }> {
  inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  constructor(props: {}) {
    super(props);
    this.state = { Symbol: "ETH-BTC" };
  }

  showMarket = () => {
    if (
      this.inputRef &&
      this.inputRef.current &&
      this.inputRef.current.value != null
    ) {
      this.setState({ Symbol: this.inputRef.current.value });
      this.inputRef.current.value = "";
    }
  };

  public render() {
    return (
      <div>
        <input ref={this.inputRef} />{" "}
        <button onClick={this.showMarket}>Show</button>
        <Chart Symbol={this.state.Symbol} />
      </div>
    );
  }
}

export default App;
