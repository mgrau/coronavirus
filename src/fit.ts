import regression from "regression";

const msToDay = 24 * 60 * 60 * 1000;

export default function fit(
  t: Array<Date>,
  y: Array<number>,
  daysToFit = 10,
  daysToPredict = 5
) {
  const tfit = t.slice(t.length - daysToFit);
  const yfit = y.slice(y.length - daysToFit);
  const fit = regression.exponential(
    tfit.map((v, i) => [(Number(tfit[i]) - Number(tfit[0])) / msToDay, yfit[i]])
  );
  const predict = Array.from(
    Array(daysToFit + daysToPredict).keys()
  ).map(value => Math.round(fit.predict(value)[1]));

  const tpredict = Array.from(Array(daysToFit + daysToPredict).keys()).map(
    value => new Date(Number(tfit[0]) + msToDay * value)
  );

  return {
    x: tpredict,
    y: predict,
    string: fit.string,
    r2: fit.r2,
    equation: fit.equation
  };
}
