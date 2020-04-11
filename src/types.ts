export interface Row {
  region: string;
  subregion: string;
  location: Location;
  data: {
    t: Array<Date>;
    y: Array<number>;
  };
}

export interface Combined {
  region: string;
  subregion: string;
  population: number;
  location: Location;
  t: Array<Date>;
  cases: Array<number>;
  infected: Array<number>;
  recovered: Array<number>;
  deaths: Array<number>;
}

interface Location {
  latitude: number;
  longitude: number;
}
