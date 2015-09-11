#!/bin/bash

rm -f data/map.json

ogr2ogr \
  -f GeoJSON \
  -where "ADM0_A3 IN ('SYR', 'AFG', 'SRB', 'IRQ', 'ALB', 'ERT', 'PAK', 'SOM', 'CHI', 'UKR') OR Continent IN ('Europe')" \
  data/map.json \
  data/ne_10m_admin_0_countries.shp

topojson \
  -o data/topomap.json \
  -p ADM0_A3 \
  -- \
  data/map.json
