import * as React from "react";
import Plot from "react-plotly.js";
import regression from "regression";

import { Row } from "./app";
import "./css/figure.css";

export default class Figure extends React.Component<
  {
    title: string;
    cases: Row;
    recovered: Row;
    deaths: Row;
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

    const infected = this.props.cases.data.y.map(
      (value, index) =>
        value -
        this.props.deaths.data.y[index] -
        this.props.recovered.data.y[index]
    );

    const msDay = 24 * 60 * 60 * 1000;
    const tfit = this.props.cases.data.t.slice(
      this.props.cases.data.t.length - 10
    );
    const yfit = this.props.cases.data.y.slice(
      this.props.cases.data.y.length - 10
    );
    const data = tfit.map((v, i) => [
      (Number(tfit[i]) - Number(tfit[0])) / msDay,
      yfit[i]
    ]);
    const fit = regression.exponential(data);
    const predict = Array.from(Array(14).keys()).map(value =>
      fit.predict(value)
    );

    return (
      <Plot
        data={[
          !isNaN(fit.r2)
            ? {
                x: predict.map(
                  value => new Date(value[0] * msDay + Number(tfit[0]))
                ),
                y: predict.map(value => Math.round(value[1])),
                type: "scatter",
                mode: "lines",
                name: "extrapolation: " + fit.string,
                line: {
                  dash: "dash",
                  width: 0.75,
                  color: "black"
                }
              }
            : {},
          {
            x: this.props.cases.data.t,
            y: this.props.cases.data.y,
            type: "scatter",
            mode: "lines",
            name: "cases",
            marker: { color: "blue" }
          },
          {
            x: this.props.cases.data.t,
            y: infected,
            type: "scatter",
            mode: "lines",
            name: "infected",
            marker: { color: "orange" }
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
        layout={{
          yaxis: {
            type: this.props.log ? "log" : "linear",
            autorange: true
          },
          autosize: true,
          margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 0
          },
          legend: {
            x: 0,
            xanchor: "left",
            y: 1
          },
          title:
            this.props.title +
            (!isNaN(fit.r2)
              ? ": cases doubling every " +
                (Math.log(2) / fit.equation[1]).toFixed(1) +
                " days"
              : "")
        }}
        useResizeHandler={true}
        className="figure"
      />
    );
  }
}
