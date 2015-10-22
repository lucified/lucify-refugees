# The flow of asylum seekers in Europe

A visualization of the flow of asylum seekers in European countries from 2012 onwards. Based on UNHCR data. See it in action [here](http://dev.lucify.com/the-flow-towards-europe/). For a more in-depth explanation, read [this blog post](https://medium.com/@lucify/a-novel-visualisation-of-the-refugee-crisis-565e40ab5a50).

![Visualization screenshot](asylum-seekers-screenshot.png)

This project uses a combination of [React](https://facebook.github.io/react/), [D3.js](http://d3js.org/) and [PIXI.js](http://www.pixijs.com/).


## Installation

### Dependencies

- Node + npm
- Ruby + [RubyGems](https://rubygems.org/pages/download)
- Bundler: `gem install bundler`
- GDAL: `brew install gdal` (this works on OS X, for other options see <http://www.gdal.org/>)
- simplify-geojson: `npm install -g simplify-geojson`
- topojson: `npm install -g topojson`
- mocha (for running unit tests): `npm install -g mocha`

### Setup and running

Run the following in the project directory:

1. `npm install`
2. `bundle install`
3. `node ./node_modules/gulp/bin/gulp.js`

This project requires gulp 4.0, which is installed by `npm install` under `node_modules`. To be able to use the plain `gulp` command, make sure you have gulp-cli version 0.4 installed:
```
npm install gulpjs/gulp-cli#4.0 -g
```

### Distribution build

A distribution is built by the command `gulp dist` or `node ./node_modules/gulp/bin/gulp.js dist`.

You will likely need to edit the `embedBaseUrl` and `assetContext` parameters in `gulpfile.babel.js` to match your hosting environment. If you are hosting the component at `http://www.example.com/static/lucify-refugees`, you should set embedBaseUrl to `http://www.example.com/static/lucify-refugees/` and `assetContext` to `static/lucify-refugees/`.

### Publish to Amazon S3

The project includes a gulp task for publishing the project to Amazon S3. It will use credentials from the AWS credentials file (<http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html>).

In addition to setting up the credentials file, you should change the `defaultBucket` option in `gulfile.babel.js` to match the name of your S3 bucket. Additionally, you may wish to change the `maxAge` option, which affects the cache-control header of assets whose filenames have content hashes.

Run the publish task with `gulp s3-deploy` or `node ./node_modules/gulp/bin/gulp.js s3-deploy`.

### Tests

Unit tests are started with:

```
mocha
```


## Data source

[UNHCR monthly asylum applications](http://popstats.unhcr.org/en/asylum_seekers_monthly)

	To update to the latest data, open the UNHCR asylum applications data portal, select the options below and click on Export / Current View / CSV:

		- Years: 2012, 2013, 2014, 2015
		- Months: All months
		- Country of asylum: All countries
		- Origin: All countries
		- Data item to display: Country of asylum, origin, year

	Save the resulting file as `data/unhcr_popstats_export_asylum_seekers_monthly.csv`, remove the first four (header) rows and run `gulp prepare-data` to generate the required JSON file for the visualization.

	Once you have new data, you can change the time period during which the visualization runs by updating the values in `src/js/model/refugee-constants.js`. Note that changing these values has not been extensively tested, and might result in glitches.

## Authors

Have feedback? Contact us!

- [Juho Ojala](https://twitter.com/ojalajuho)
- [Ville Saarinen](https://twitter.com/vsaarinen)

## License

The MIT License (MIT)

Copyright (c) 2015 Juho Ojala and Ville Saarinen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


