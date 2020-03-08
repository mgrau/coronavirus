import * as React from "react";
import Papa from "papaparse";

import Figure from "./figure";

import "./css/app.css";

export default class App extends React.Component<
  {},
  {
    selection: Array<string>;
    regions: Array<string>;
    cases: Array<Row>;
    recovered: Array<Row>;
    deaths: Array<Row>;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      selection: [],
      regions: [],
      cases: [],
      recovered: [],
      deaths: []
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
          .slice(4, -1)
          .map(value => new Date(value)),
        y: Object.values(line)
          .slice(4, -1)
          .map(value => Number(value))
      }
    };
  }

  filter(data: Array<Row>, selection: Array<string>): Array<Row> {
    if (selection === null) return null;
    return selection.map(region => {
      const cases = data.filter(row => row.region === region);

      if (cases.length === 0) return undefined;
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
          const cases = result.data.map(this.parseLine);
          const regions = cases
            .map(value => value.region)
            .filter((value, index, array) => array.indexOf(value) === index);
          this.setState({ regions: regions, cases: cases });
        }
      }
    );
    Papa.parse(
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv",
      {
        header: true,
        download: true,
        complete: result => {
          const cases = result.data.map(this.parseLine);
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
          const cases = result.data.map(this.parseLine);
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
        {region}
      </option>
    ));

    console.log(cases);

    // const figures = null;
    const figures = this.state.selection.map((value, index, array) => {
      return (
        <Figure
          key={index}
          title={value}
          cases={cases[index]}
          recovered={recovered[index]}
          deaths={deaths[index]}
        />
      );
    });

    return (
      <div id="select">
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
        {figures}
      </div>
    );
  }
}

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
