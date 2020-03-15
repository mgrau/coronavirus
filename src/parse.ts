import Papa from "papaparse";
import { Row, Combined } from "./types";

// URLs from the JHU CSSE dataset
const URLS = {
  cases:
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
  recovered:
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv",
  deaths:
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv"
};

// combine the CSV files into one object
export async function parseAll(): Promise<Array<Combined>> {
  const cases = await parseData(URLS.cases);
  const recovered = await parseData(URLS.recovered);
  const deaths = await parseData(URLS.deaths);

  cases.every(row => row.data.y[row.data.y.length - 1] === 0);
  return (
    cases
      .map((row, index) => {
        return {
          region: row.region,
          subregion: row.subregion,
          location: row.location,
          t: row.data.t,
          cases: row.data.y,
          infected: row.data.y.map(
            (value, i) =>
              value - recovered[index].data.y[i] - deaths[index].data.y[i]
          ),
          recovered: recovered[index].data.y,
          deaths: deaths[index].data.y
        };
      })
      // if the raw data ends in zeros, remove that day.
      .map(row => {
        if (cases.every(row => row.data.y[row.data.y.length - 1] === 0)) {
          return {
            ...row,
            t: row.t.slice(0, -1),
            cases: row.cases.slice(0, -1),
            infected: row.infected.slice(0, -1),
            recovered: row.recovered.slice(0, -1),
            deaths: row.deaths.slice(0, -1)
          };
        } else {
          return row;
        }
      })
  );
}

// parses each CSV file from the dataset
export function parseData(url: string) {
  return new Promise<Array<Row>>(resolve => {
    Papa.parse(url, {
      header: true,
      download: true,
      complete: result => {
        resolve(
          // remove lines where region is empty
          result.data.map(parseLine).filter(row => row.region !== undefined)
        );
      }
    });
  });
}

// parses a single line from CSV file
function parseLine(line: Object): Row {
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
