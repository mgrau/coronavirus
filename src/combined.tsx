import * as React from "react";
import Plot from "react-plotly.js";
import fit from "./fit";

import "./css/figure.css";
import Regions from "./regions";

export default function CombinedFigure(props: {
  regions: Array<{ name: string; t: Array<Date>; y: Array<number> }>;
  log?: boolean;
}) {
  //   const predict = fit(props.t, props.infected);

  const lines = props.regions.map(region => ({
    name: region.name,
    x: region.t,
    y: region.y
  }));

  return (
    <Plot
      data={lines}
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
        title: "Number of current cases"
      }}
      useResizeHandler={true}
      className="figure"
    />
  );
}
