# Coronavirus Plots

This repo makes timeseries plots of the number of cases of novel coronavirus COVID-19 broken out by region. It uses the dataset assembled by Johns Hopkins CSSE, available at https://github.com/CSSEGISandData/COVID-19.

The plots can be viewed at https://mgrau.github.io/coronavirus/

## Building

To create your own version, fork and clone this repo, and then run

```
yarn install
yarn start
```

to start the development server. Once you are happy with this, switch to the `gh-pages` branch and run

```
yarn deploy
```

Then commit and push those changes the your page should be live on github.io.
