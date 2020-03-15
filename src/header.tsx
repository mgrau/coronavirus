import * as React from "react";

export default function Header(props: { lastUpdated: Date }) {
  return (
    <div id="header">
      <p>
        Data on COVID-19 cases provided by the{" "}
        <a href="https://systems.jhu.edu/research/public-health/ncov/">
          JHU CSSE
        </a>{" "}
        repo on <a href="https://github.com/CSSEGISandData/COVID-19">Github</a>.
        Last updated on{" "}
        {props.lastUpdated === null ? "" : props.lastUpdated.toDateString()}
      </p>
    </div>
  );
}
