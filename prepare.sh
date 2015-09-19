#!/bin/bash

rm -f data/map.json
rm -f data/labels.json


ogr2ogr \
  -f GeoJSON \
  -where "ADM0_A3 IN ('SYR', 'AFG', 'SRB', 'IRQ', 'ALB', 'ERI', 'PAK', 'SOM', 'CHI', 'UKR', 'TUR', 'CYP', 'PSE') OR Continent IN ('Europe') OR REGION_WB IN ('Sub-Saharan Africa', 'Middle East & North Africa') OR SUBREGION IN ('Western Asia', 'Central Asia', 'Southern Asia', 'Eastern Asia', 'South-Eastern Asia')" \
  data/map.json \
  data/ne_10m_admin_0_countries.shp

node_modules/topojson/bin/topojson \
  -o data/topomap.json \
  -p ADM0_A3 \
  -- \
  data/map.json

ogr2ogr \
  -f GeoJSON \
  -where "scalerank IN (0)" \
  data/labels.json \
  data/ne_10m_admin_0_label_points.shp


#ogr2ogr \
#  -f GeoJSON \
#  data/fullmap.json \
#  data/ne_10m_admin_0_countries.shp
