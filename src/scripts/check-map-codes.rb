#!/usr/bin/env ruby

require 'json'

map_data = JSON.parse(File.read('./temp/map.json'))
country_codes = map_data['features'].map { |country| country['properties']['ADM0_A3'] }

asylum_data = JSON.parse(File.read('./temp/data-assets/asylum.json'))
missing_origin_countries = asylum_data.map{ |data| data['oc'] }.uniq.reject{ |origin_country| country_codes.include? origin_country }
missing_asylum_countries = asylum_data.map{ |data| data['ac'] }.uniq.reject{ |destination_country| country_codes.include? destination_country }

puts "Missing origin countries: #{missing_origin_countries}"
puts "Missing asylum countries: #{missing_asylum_countries}"
