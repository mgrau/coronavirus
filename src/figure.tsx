import * as React from "react";
import Plot from "react-plotly.js";
import fit from "./fit";

import "./css/figure.css";

export default class Figure extends React.Component<
  {
    region: string;
    t: Array<Date>;
    cases: Array<number>;
    infected: Array<number>;
    recovered: Array<number>;
    deaths: Array<number>;
    log?: boolean;
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

    const predict = fit(this.props.t, this.props.infected);
    return (
      <Plot
        data={[
          isNaN(predict.r2)
            ? {}
            : {
                ...predict,
                type: "scatter",
                mode: "lines",
                name: "extrapolation: " + predict.string,
                line: {
                  dash: "dash",
                  width: 0.75,
                  color: "black"
                }
              },
          {
            x: this.props.t,
            y: this.props.cases,
            type: "scatter",
            mode: "lines",
            name: "cases",
            marker: { color: "blue" }
          },
          {
            x: this.props.t,
            y: this.props.infected,
            type: "scatter",
            mode: "lines",
            name: "infected",
            marker: { color: "orange" }
          },
          {
            x: this.props.t,
            y: this.props.recovered,
            type: "scatter",
            mode: "lines",
            name: "recovered",
            marker: { color: "green" }
          },
          {
            x: this.props.t,
            y: this.props.deaths,
            type: "scatter",
            mode: "lines",
            name: "deaths",
            marker: { color: "red" }
          }
        ]}
        layout={{
          yaxis: {
            type: this.props.log ? "log" : "linear",
            autorange: true
          },
          autosize: true,
          margin: {
            l: 50,
            r: 50,
            b: 30,
            t: 75,
            pad: 0
          },
          legend: {
            x: 0,
            xanchor: "left",
            y: 1,
            bgcolor: "rgba(0,0,0,0)"
          },
          title:
            this.props.region +
            (!isNaN(predict.r2)
              ? ` cases ${
                  predict.equation[1] > 0 ? "doubling" : "halving"
                } every ${(Math.log(2) / Math.abs(predict.equation[1])).toFixed(
                  1
                )} days`
              : "")
        }}
        useResizeHandler={true}
        className="figure"
      />
    );
  }
}
