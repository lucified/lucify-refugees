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
3. `node ./node_modules/gulp/bin/gulp`


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

