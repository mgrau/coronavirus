import * as React from "react";

export default function Regions(props: {
  alphabetical?: boolean;
  regions: Array<{ region: string; cases: number }>;
  select: (selection: Array<string>) => void;
}) {
  return (
    <select
      multiple
      id="regions"
      onChange={event =>
        props.select(
          Array.from(event.target.options)
            .filter(option => option.selected)
            .map(option => option.value)
        )
      }
    >
      {props.regions
        .sort((a, b) => {
          if (props.alphabetical) {
            if (a.region === "All") return -1;
            if (b.region === "All") return 1;
            if (a.region === "All except China") return -1;
            if (b.region === "All except China") return 1;
            if (a.region < b.region) return -1;
            if (a.region > b.region) return 1;
            return 0;
          } else {
            return b.cases - a.cases;
          }
        })
        .map((value, index) => (
          <option key={index} value={value.region}>
            {value.region}: {value.cases}
          </option>
        ))}
    </select>
  );
}
