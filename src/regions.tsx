import * as React from "react";

export default function Regions(props: {
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
        .sort((a, b) => b.cases - a.cases)
        .map((value, index) => (
          <option key={index} value={value.region}>
            {value.region}: {value.cases}
          </option>
        ))}
    </select>
  );
}
