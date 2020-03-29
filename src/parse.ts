import Papa from "papaparse";
import { Row, Combined } from "./types";

const country_names = {
  SriLanka: "Sri Lanka",
  "United States": "US",
  "South Korea": "Korea, South",
  Congo: "Congo (Kinshasa)",
  "Russian Federation": "Russia",
  Gambia: "Gambia, The",
  Bahamas: "Bahamas, The",
  "Fiji Islands": "Fiji",
  "Ivory Coast": "Cote d'Ivoire",
  "Czech Republic": "Czechia"
};

const population = require("country-json/src/country-by-population")
  .concat([
    { country: "Serbia", population: 7022000 },
    { country: "Holy See", population: 1000 },
    { country: "Cruise Ship", population: 3711 },
    { country: "Taiwan*", population: 23780000 },
    { country: "Eswatini", population: 1367000 },
    { country: "Kosovo", population: 1831000 },
    { country: "Congo (Brazzaville)", population: 1800000 },
    { country: "Montenegro", population: 631219 }
  ])
  .map(row =>
    country_names[row.country] === undefined
      ? row
      : { ...row, country: country_names[row.country] }
  );

// URLs from the JHU CSSE dataset
const URLS = {
  cases:
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv",
  recovered:
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv",
  deaths:
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
};

// combine the CSV files into one object
export async function parseAll(): Promise<Array<Combined>> {
  const cases = await parseData(URLS.cases);
  const recovered = await parseData(URLS.recovered);
  const deaths = await parseData(URLS.deaths);

  return (
    cases
      .map((row, index) => {
        const cpop = population.find(irow => irow.country == row.region);
        const deaths_row = deaths.find(
          irow => irow.region === row.region && irow.subregion === row.subregion
        );
        const recovered_row = recovered.find(
          irow => irow.region === row.region && irow.subregion === row.subregion
        );

        return {
          region: row.region,
          subregion: row.subregion,
          population: cpop === undefined ? undefined : cpop.population,
          location: row.location,
          t: row.data.t,
          cases: row.data.y,
          infected: row.data.y.map(
            (value, i) =>
              value -
              (recovered_row === undefined ? 0 : recovered_row.data.y[i]) -
              deaths_row.data.y[i]
          ),
          recovered: recovered_row === undefined ? [0] : recovered_row.data.y,
          deaths: deaths_row.data.y
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
