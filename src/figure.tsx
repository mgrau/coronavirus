import * as React from "react";
import Plot from "react-plotly.js";

import { Row } from "./app";

export default class Figure extends React.Component<
  {
    title: string;
    cases: Row;
    recovered: Row;
    deaths: Row;
  },
  {}
> {
  render() {
    if (
      this.props.cases === undefined ||
      this.props.recovered === undefined ||
      this.props.deaths === undefined
    )
      return null;
    return (
      <div className="figure">
        <Plot
          data={[
            {
              x: this.props.cases.data.t,
              y: this.props.cases.data.y,
              type: "scatter",
              mode: "lines",
              name: "cases",
              marker: { color: "blue" }
            },
            {
              x: this.props.recovered.data.t,
              y: this.props.recovered.data.y,
              type: "scatter",
              mode: "lines",
              name: "recovered",
              marker: { color: "green" }
            },
            {
              x: this.props.deaths.data.t,
              y: this.props.deaths.data.y,
              type: "scatter",
              mode: "lines",
              name: "deaths",
              marker: { color: "red" }
            }
          ]}
          layout={{ title: this.props.title }}
        />
      </div>
    );
  }
}
