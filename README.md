# The flow towards Europe

A visualization of the flow of asylum seekers to European countries from 2012 onwards. Based on UNHCR data. See it in action [here](http://www.lucify.com/the-flow-towards-europe/). For a more in-depth explanation, read [this blog post](https://medium.com/@lucify/a-novel-visualisation-of-the-refugee-crisis-565e40ab5a50).

![Visualization screenshot](https://raw.githubusercontent.com/lucified/lucify-refugees/master/screenshot.png)

This project uses a combination of [React](https://facebook.github.io/react/), [D3.js](http://d3js.org/) and [PIXI.js](http://www.pixijs.com/).


## Development

### Dependencies

- Node + NPM
- Development: Bundler: `gem install bundler`
- Development: Ruby + [RubyGems](https://rubygems.org/pages/download)
- Development: GDAL (<http://www.gdal.org/>). On OS X with homebrew install with `brew install gdal`.
- Testing: Mocha, for running unit tests: `npm install -g mocha`

### Setup and running

Run the following in the project directory:

1. `npm install`
2. `gulp` or `node ./node_modules/gulp/bin/gulp.js`

This project requires gulp 4.0, which is installed by `npm install` under `node_modules`. To be able to use the plain `gulp` command as above, make sure you have gulp-cli version 0.4 installed:
```
npm install gulpjs/gulp-cli#4.0 -g
```

For development, run `bundle install` as well.

### Distribution build

A distribution is built by the command `gulp dist`.

You will likely need to edit the `embedBaseUrl` and `assetContext` parameters in `gulpfile.babel.js` to match your hosting environment. If you are hosting the component at `http://www.example.com/static/refugees`, you should set embedBaseUrl to `http://www.example.com/` and `assetContext` to `static/refugees/`.

### Publish to Amazon S3

The project includes a gulp task for publishing the project to Amazon S3. It will use credentials from the AWS credentials file (<http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html>).

In addition to setting up the credentials file, you should change the `defaultBucket` option in `gulfile.babel.js` to match the name of your S3 bucket. Additionally, you may wish to change the `maxAge` option, which affects the cache-control header of assets with filenames having content hashes.

Run the publish task with `gulp s3-deploy`.

### Unit tests

Run unit test with the command `mocha` in thr project directory.

### Embed codes

The build automatically creates a file called `embed-codes.html` alongside `index.html`. It contains embed codes for embedding the visualisation into other pages through an iFrame.

Use embed codes from <http://www.lucify.com/embed/the-flow-towards-europe/embed-codes.html> to embed the visualisation via our Akamai-backed hosting.

## Data source

[UNHCR monthly asylum applications](http://popstats.unhcr.org/en/asylum_seekers_monthly)

If you update the data, you can change the time period during which the visualization runs by updating the values in `src/js/model/refugee-constants.js`. Note that changing these values has not been extensively tested, and might result in glitches.

### Automatic download

Run the included download script:

```
$ src/scripts/download-unhcr-data.sh
```

Run `gulp prepare-data` to generate the JSON file for the visualization.

### Manual download

If you prefer to download the data manually, open the UNHCR asylum applications data portal, select the options below and click on Export / Current View / CSV:

+ Years: 2012, 2013, 2014, 2015
+ Months: All months
+ Country of asylum: All countries
+ Origin: All countries
+ Data item to display: Country of asylum, origin, year

Save the resulting file as `data/unhcr_popstats_export_asylum_seekers_monthly.csv`, remove the first four (header) rows and run `gulp prepare-data` to generate the JSON file for the visualization.


## Authors

Have feedback? Contact us!

- [Juho Ojala](https://github.com/juhoojala)
- [Ville Saarinen](https://github.com/vsaarinen)

## License

This project is released under the [MIT license](LICENSE).
