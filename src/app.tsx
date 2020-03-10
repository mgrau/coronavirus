import * as React from "react";
import Papa from "papaparse";

import Figure from "./figure";

import "./css/app.css";

export interface Row {
  region: string;
  subregion: string;
  location: {
    latitude: number;
    longitude: number;
  };
  data: {
    t: Array<Date>;
    y: Array<number>;
  };
}

export default class App extends React.Component<
  {},
  {
    selection: Array<string>;
    regions: Array<string>;
    cases: Array<Row>;
    recovered: Array<Row>;
    deaths: Array<Row>;
    log: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      selection: [],
      regions: [],
      cases: [],
      recovered: [],
      deaths: [],
      log: false;
    };
  }

  parseLine(line: Object): Row {
    return {
      region: line["Country/Region"],
      subregion: line["Province/State"],
      location: {
        latitude: Number(line["Lat"]),
        longitude: Number(line["Long"])
      },
      data: {
        t: Object.keys(line)
          .slice(4)
          .map(value => new Date(value)),
        y: Object.values(line)
          .slice(4)
          .map(value => Number(value))
      }
    };
  }

  filter(data: Array<Row>, selection: Array<string>): Array<Row> {
    if (selection === null) return null;

    return selection.map(region => {
      const cases = data.filter(row => row.region === region || region === "All");
      if (cases.length === 0) return undefined;
      if (cases.length === 1) return cases[0];
      return cases.reduce((previous, current) => {
        return {
          ...previous,
          data: {
            t: previous.data.t,
            y: previous.data.y.map(
              (value, index) => value + current.data.y[index]
            )
          }
        };
      }, cases[0]);
    });
  }

  componentDidMount() {
    Papa.parse(
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
      {
        header: true,
        download: true,
        complete: result => {
          const cases = result.data.map(this.parseLine).filter(row => row.region !== undefined);
          const regions = ["All"].concat(cases
            .map(value => value.region)
            .filter((value, index, array) => array.indexOf(value) === index)
            .sort((a, b) => {
              const l = cases[0].data.y.length;
              return (
                this.filter(cases, [b])[0].data.y[l - 1] -
                this.filter(cases, [a])[0].data.y[l - 1]
              );
            }));
          this.setState({
            selection: [regions[0]],
            regions: regions,
            cases: cases
          });
        }
      }
    );
    Papa.parse(
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv",
      {
        header: true,
        download: true,
        complete: result => {
          const cases = result.data.map(this.parseLine).filter(row => row.region !== undefined);
          this.setState({ recovered: cases });
        }
      }
    );
    Papa.parse(
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv",
      {
        header: true,
        download: true,
        complete: result => {
          const cases = result.data.map(this.parseLine).filter(row => row.region !== undefined);
          this.setState({ deaths: cases });
        }
      }
    );
  }

  render() {
    const cases = this.filter(this.state.cases, this.state.selection);
    const recovered = this.filter(this.state.recovered, this.state.selection);
    const deaths = this.filter(this.state.deaths, this.state.selection);

    const regions = this.state.regions.map((region, index) => (
      <option key={index} value={region}>
        {region}:{" "}
        {
          this.filter(this.state.cases, [region])[0].data.y[
            this.state.cases[0].data.y.length - 1
          ]
        }
      </option>
    ));

    const figures = this.state.selection.map((value, index, array) => {
      return (
        <Figure
          key={index}
          title={value}
          cases={cases[index]}
          recovered={recovered[index]}
          deaths={deaths[index]}
          log={this.state.log}
        />
      );
    });

    return (
      <div id="app">
        <select
          multiple
          id="regions"
          onChange={event => {
            this.setState({
              selection: Array.from(event.target.options)
                .filter(option => option.selected)
                .map(option => option.value)
            });
          }}
        >
          {regions}
        </select>
        <div id="log-check">
          <p>
          <input 
          type="checkbox" 
          onChange={event => this.setState({log: event.target.checked})}/>
          <label>Log Plot</label></p>
        </div>
        {figures}
          <p>
            Data on COVID-19 cases provided by <a href="https://systems.jhu.edu/research/public-health/ncov/">JHU CSSE</a> on <a href="https://github.com/CSSEGISandData/COVID-19">github</a>
          </p>
      </div>
    );
  }
}
