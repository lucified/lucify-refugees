#!/bin/bash

# Clean up
rm -rf temp data/*.json
# Create directory structure
gulp prepare-skeleton


ogr2ogr \
  -f GeoJSON \
  -where "ADM0_A3 IN ('SYR', 'AFG', 'SRB', 'IRQ', 'ALB', 'ERI', 'PAK', 'SOM', 'CHI', 'UKR', 'TUR', 'CYP', 'PSE') OR Continent IN ('Europe') OR REGION_WB IN ('Sub-Saharan Africa', 'Middle East & North Africa') OR SUBREGION IN ('Western Asia', 'Central Asia', 'Southern Asia', 'Eastern Asia', 'South-Eastern Asia')" \
  temp/detailed-map.json \
  data/ne_10m_admin_0_countries.shp

# 0.15
cat temp/detailed-map.json | simplify-geojson -t 0.15 > temp/map.json

node_modules/.bin/topojson \
  -o temp/data-assets/topomap.json \
  -p ADM0_A3 \
  -- \
  temp/map.json


### Process UNHCR data
src/scripts/prepare-asylum-data.rb

# we are not using the labels for anything

#ogr2ogr \
#  -f GeoJSON \
#  -where "scalerank IN (0)" \
#  data/labels.json \
#  data/ne_10m_admin_0_label_points.shp


# this was just for development

#ogr2ogr \
#  -f GeoJSON \
#  data/fullmap.json \
#  data/ne_10m_admin_0_countries.shp
