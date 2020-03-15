export interface Row {
  region: string;
  subregion: string;
  location: {
    latitude: number;
    longitude: number;
  };
  data: {
    t: Array<Date>;
    y: Array<number>;
  };
}
