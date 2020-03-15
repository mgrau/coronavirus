import * as React from "react";

import Figure from "./figure";

import "./css/app.css";
import { Combined } from "./types";
import { parseAll } from "./parse";
import Regions from "./regions";
import Header from "./header";
import Footer from "./footer";

function addArray(a: Array<number>, b: Array<number>): Array<number> {
  return a.map((value, index) => value + b[index]);
}

export default class App extends React.Component<
  {},
  {
    selection: Array<string>;
    regions: Array<string>;
    data: Array<Combined>;
    length: number;
    lastUpdated: Date;
    log: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      selection: [],
      regions: [],
      data: [],
      length: 0,
      lastUpdated: null,
      log: false
    };
  }

  filter(selection: Array<string>): Array<Combined> {
    if (selection === null) return null;

    return selection.map(region => {
      const cases = this.state.data.filter(
        row =>
          row.region === region ||
          region === "All" ||
          (region === "All except China" && row.region !== "China")
      );
      if (cases.length === 0) return undefined;
      else if (cases.length === 1) return cases[0];
      else {
        return cases.slice(1).reduce((previous, current) => {
          return {
            ...previous,
            cases: addArray(previous.cases, current.cases),
            infected: addArray(previous.infected, current.infected),
            recovered: addArray(previous.recovered, current.recovered),
            deaths: addArray(previous.deaths, current.deaths)
          };
        }, cases[0]);
      }
    });
  }

  componentDidMount = async () => {
    const data = await parseAll();
    const regions = ["All", "All except China"]
      .concat(data.map(value => value.region))
      .filter((value, index, array) => array.indexOf(value) === index);
    const length = data[0].t.length - 1;
    this.setState({
      selection: [regions[0]],
      regions: regions,
      length: length,
      lastUpdated: data[0].t[length],
      data: data
    });
  };

  render() {
    const figures = this.filter(this.state.selection).map((row, index) => {
      return <Figure {...row} key={index} log={this.state.log} />;
    });

    return (
      <div id="app">
        <Regions
          regions={this.state.regions.map(region => {
            return {
              region: region,
              cases: this.filter([region])[0].cases[this.state.length]
            };
          })}
          select={selection => this.setState({ selection: selection })}
        />
        <div id="log-check">
          <p>
            <input
              type="checkbox"
              onChange={event => this.setState({ log: event.target.checked })}
            />
            <label>Log Plot</label>
          </p>
        </div>

        {figures}
        <Header lastUpdated={this.state.lastUpdated} />
        <Footer />
      </div>
    );
  }
}
