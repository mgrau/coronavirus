import * as React from "react";
import Plot from "react-plotly.js";
import fit from "./fit";

import "./css/figure.css";

export default function Figure(props: {
  region: string;
  t: Array<Date>;
  cases: Array<number>;
  infected: Array<number>;
  recovered: Array<number>;
  deaths: Array<number>;
  log?: boolean;
}) {
  if (
    props.cases === undefined ||
    props.recovered === undefined ||
    props.deaths === undefined
  )
    return null;

  const predict = fit(props.t, props.infected);
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
          x: props.t,
          y: props.cases,
          type: "scatter",
          mode: "lines",
          name: "cases",
          marker: { color: "blue" }
        },
        {
          x: props.t,
          y: props.infected,
          type: "scatter",
          mode: "lines",
          name: "infected",
          marker: { color: "orange" }
        },
        {
          x: props.t,
          y: props.recovered,
          type: "scatter",
          mode: "lines",
          name: "recovered",
          marker: { color: "green" }
        },
        {
          x: props.t,
          y: props.deaths,
          type: "scatter",
          mode: "lines",
          name: "deaths",
          marker: { color: "red" }
        }
      ]}
      layout={{
        yaxis: {
          type: props.log ? "log" : "linear",
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
          props.region +
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
