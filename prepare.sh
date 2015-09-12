#!/bin/bash

rm -f data/map.json

ogr2ogr \
  -f GeoJSON \
  -where "ADM0_A3 IN ('SYR', 'AFG', 'SRB', 'IRQ', 'ALB', 'ERI', 'PAK', 'SOM', 'CHI', 'UKR', 'TUR', 'CYP', 'PSE') OR Continent IN ('Europe') OR REGION_WB IN ('Sub-Saharan Africa', 'Middle East & North Africa')" \
  data/map.json \
  data/ne_10m_admin_0_countries.shp

topojson \
  -o data/topomap.json \
  -p ADM0_A3 \
  -- \
  data/map.json


#ogr2ogr \
#  -f GeoJSON \
#  data/fullmap.json \
#  data/ne_10m_admin_0_countries.shp