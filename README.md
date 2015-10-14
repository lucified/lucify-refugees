# Migration visualized

See asylum seekers and displaced people in and around Europe from 2012 onwards.By default, each dot represents around 25 people.

TODO: is migration the correct word for these movements?

## Data sources

1. Asylum applications: http://popstats.unhcr.org/en/asylum_seekers_monthly
2. Persons of Concern around Syria: http://data.unhcr.org/syrianrefugees/regional.php

## Installation

### Dependencies

- Node + NPM
- Ruby + [RubyGems](https://rubygems.org/pages/download)
- Bundler: `gem install bundler`
- GDAL: `brew install gdal`

### Setup

1. `npm install`
2. `./node_modules/bower/bin/bower install`
3. `bundle install`
4. `npm install -g simplify-geojson`
5. `npm install -g topojson`
6. `node ./node_modules/gulp/bin/gulp`

Gulp should be version 4, which is defined in package.json and thus will be installed into `node_modules`. To be able to use the plain `gulp` command, make sure you have gulp-cli version 0.4.
```
npm install gulpjs/gulp-cli#4.0 -g
```

## Notes

http://www.goodboydigital.com/pixijs/bunnymark_v3/
https://github.com/cambecc/earth/blob/master/public/libs/earth/1.0.0/earth.js
draw() -funktio

## Ubuntu install

(Incomplete notes)

sudo apt-get install nodejs
sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo apt-get install git
sudo apt-get install npm libav-tool
sudo npm install -g gulp topojson bower
sudo gem install bundler

### GDAL

http://www.sarasafavi.com/installing-gdalogr-on-ubuntu.html
sudo add-apt-repository ppa:ubuntugis/ubuntugis-unstable 
sudo apt-get update
sudo apt-get install gdal-bin

### Phantomjs

Must be version 1.9.8.
wget https://gist.githubusercontent.com/julionc/7476620/raw/e8f36f2a2d616720983e8556b49ec21780c96f0c/install_phantomjs.sh
chmod a+x install_phantomjs.sh
sudo ./install_phantomjs.sh

# Data

http://data.unhcr.org/
http://popstats.unhcr.org/en/persons_of_concern
http://data.unhcr.org/portfolio/

http://data.unhcr.org/dataviz/#_ga=1.261931150.2048212483.1441809196

Background info on Turkey:
https://www.afad.gov.tr/Dokuman/TR/61-2013123015505-syrian-refugees-in-turkey-2013_print_12.11.2013_eng.pdf

## Operational data portals

(Oikeasta reunasta löytyy linkkejä)
http://www.unhcr.org/pages/49c3646c4d6.html

http://data.unhcr.org/horn-of-africa/regional.php
http://data.unhcr.org/cotedivoire/country.php?id=97#_ga=1.191309097.2048212483.1441809196
http://data.unhcr.org/car/regional.php#_ga=1.191309097.2048212483.1441809196
http://data.unhcr.org/drc/regional.php#_ga=1.191309097.2048212483.1441809196
http://data.unhcr.org/mediterranean/regional.php#_ga=1.191309097.2048212483.1441809196

## Country operations profiles

http://www.unhcr.org/pages/49e486676.html#
http://www.unhcr.org/pages/49e48e0fa7f.html#
http://www.unhcr.org/pages/49e484936.html
http://www.unhcr.org/pages/49e486426.html
http://www.unhcr.org/pages/49e486426.html
http://www.unhcr.org/pages/49e486a76.html

## Non-UNHCR

https://www.humanitarianresponse.info/en/applications/data/datasets/table/dataset-types/table/locations/syrian-arab-republic

