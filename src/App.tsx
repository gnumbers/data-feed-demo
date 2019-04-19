import React, { Component } from "react";
import { Chart } from "./Market/MarketDepth";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import Portfolio from "./Portfolio";
import CurrencySelector from "./Market/CurrencySelector";
import BreakDown from "./Market/BreakDown";
import Sandbox from "./Market/Sandbox";

// class MarketSize extends Component<{}, { Symbol: string }> {
//   inputRef: React.RefObject<HTMLInputElement> = React.createRef();

//   constructor(props: {}) {
//     super(props);
//     this.state = { Symbol: "BTC-USDT" };
//   }

//   showMarket = () => {
//     if (
//       this.inputRef &&
//       this.inputRef.current &&
//       this.inputRef.current.value != null
//     ) {
//       this.setState({ Symbol: this.inputRef.current.value });
//       this.inputRef.current.value = "";
//     }
//   };

//   public render() {
//     return (
//       <div>
//         <input ref={this.inputRef} />{" "}
//         <button onClick={this.showMarket}>Show</button>
//         <Chart Symbol={this.state.Symbol} />
//       </div>
//     );
//   }
// }

const App = () => (
  <Router>
    <div>
      <Link to="/market/BTC-USDT">Market size</Link>
      <br />
      <Link to="/portfolio">Portfolio</Link>
      <br />
      <Link to="/breakdown/BTC-USDT">Breakdown</Link>
      <br />
      <Link to="/sand-box/BTC-USDT">Sandbox</Link>
      <br />
      <Route path="/market/:symbol" component={CurrencySelector} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/breakdown/:symbol" component={BreakDown} />
      <Route path="/sand-box/:symbol" component={Sandbox} />
    </div>
  </Router>
);

export default App;
