import * as React from "react";

import Figure from "./figure";

import "./css/app.css";
import { Combined } from "./types";
import { parseAll } from "./parse";
import Regions from "./regions";
import Header from "./header";
import Footer from "./footer";
import CombinedFigure from "./combined";

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
    alphabetical: boolean;
    days: number;
    combined: boolean;
    deaths: boolean;
    fraction: boolean;
    percapita: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      selection: [],
      regions: [],
      data: [],
      length: 0,
      lastUpdated: new Date(),
      log: false,
      alphabetical: false,
      days: 0,
      combined: true,
      deaths: false,
      fraction: false,
      percapita: false
    };
  }

  filter(selection: Array<string>, filter_time = true): Array<Combined> {
    if (selection === null) return null;

    return selection.map(region => {
      const cases = this.state.data
        .filter(
          row =>
            row.region === region ||
            region === "All" ||
            (region === "All except China" && row.region !== "China")
        )
        .map(row =>
          filter_time
            ? {
                ...row,
                t: row.t.slice(0, this.state.days + 1),
                cases: row.cases.slice(0, this.state.days + 1),
                infected: row.infected.slice(0, this.state.days + 1),
                recovered: row.recovered.slice(0, this.state.days + 1),
                deaths: row.deaths.slice(0, this.state.days + 1)
              }
            : row
        );
      if (cases.length === 0) return undefined;
      else if (cases.length === 1) return cases[0];
      else {
        return cases.slice(1).reduce(
          (previous, current) => {
            return {
              ...previous,
              cases: addArray(previous.cases, current.cases),
              infected: addArray(previous.infected, current.infected),
              recovered: addArray(previous.recovered, current.recovered),
              deaths: addArray(previous.deaths, current.deaths)
            };
          },
          {
            ...cases[0],
            region: region,
            population:
              region === "All"
                ? 7700000000
                : region === "All except China"
                ? 6314000000
                : cases[0].population
          }
        );
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
      days: length,
      lastUpdated: data[0].t[length],
      data: data
    });
  };

  render() {
    const figures =
      this.state.combined && this.state.selection.length > 1 ? (
        this.state.deaths ? (
          <CombinedFigure
            title={
              "Number of deaths" +
              (this.state.percapita ? " per 100,000 people" : "")
            }
            regions={this.filter(this.state.selection).map(row => ({
              name: row.region,
              t: row.t,
              y: this.state.percapita
                ? row.deaths.map(value => (100000 * value) / row.population)
                : row.deaths
            }))}
            log={this.state.log}
          />
        ) : (
          <CombinedFigure
            title={
              "Number of current cases" +
              (this.state.percapita ? " per 100,000 people" : "")
            }
            regions={this.filter(this.state.selection).map(row => ({
              name: row.region,
              t: row.t,
              y: this.state.percapita
                ? row.infected.map(value => (100000 * value) / row.population)
                : row.infected
            }))}
            log={this.state.log}
          />
        )
      ) : (
        this.filter(this.state.selection).map((row, index) => {
          return (
            <Figure
              {...row}
              key={index}
              log={this.state.log}
              fraction={this.state.fraction}
              percapita={this.state.percapita}
            />
          );
        })
      );

    let d = new Date(this.state.lastUpdated);
    d.setDate(
      this.state.lastUpdated.getDate() - (this.state.length - this.state.days)
    );

    return (
      <div id="app">
        <Regions
          alphabetical={this.state.alphabetical}
          regions={this.state.regions.map(region => {
            return {
              region: region,
              cases: this.filter([region], false)[0].cases[this.state.length]
            };
          })}
          select={selection => this.setState({ selection: selection })}
        />
        <div id="log-check">
          <p>
            <input
              type="checkbox"
              defaultChecked={this.state.log}
              onChange={event => this.setState({ log: event.target.checked })}
            />
            <label>Log Plot</label>

            <input
              type="checkbox"
              defaultChecked={this.state.combined}
              onChange={event =>
                this.setState({ combined: event.target.checked })
              }
            />
            <label>Combined Plot</label>
          </p>
        </div>

        {figures}
        <Header lastUpdated={this.state.lastUpdated} />
        <div id="options">
          <p>
            <input
              type="range"
              min="1"
              max={this.state.length}
              onChange={event =>
                this.setState({ days: Number(event.target.value) })
              }
              value={this.state.days}
            />
            <label>{d.toDateString()}</label>
          </p>
          <p>
            <input
              type="checkbox"
              defaultChecked={this.state.fraction}
              onChange={event =>
                this.setState({ fraction: event.target.checked })
              }
            />
            <label>Show data as fraction of cases</label>
          </p>
          {this.state.combined ? (
            <p>
              <input
                type="checkbox"
                defaultChecked={this.state.deaths}
                onChange={event =>
                  this.setState({ deaths: event.target.checked })
                }
              />
              <label>Compare deaths</label>
            </p>
          ) : null}
          <p>
            <input
              type="checkbox"
              defaultChecked={this.state.percapita}
              onChange={event =>
                this.setState({ percapita: event.target.checked })
              }
            />
            <label>Show data per capita (per 100,000 people)</label>
          </p>
        </div>
        <Footer />
      </div>
    );
  }
}
