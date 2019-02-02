import React, { Component } from "react";
import { Chart } from "./MarketDepth";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import Portfolio from "./Portfolio";

class MarketSize extends Component<{}, { Symbol: string }> {
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

const App = () => (
  <Router>
    <div>
      <Link to="/">Market size</Link>
      <br />
      <Link to="/portfolio">Portfolio</Link>
      <Route exact={true} path="/" component={MarketSize} />
      <Route path="/portfolio" component={Portfolio} />
    </div>
  </Router>
);

export default App;
