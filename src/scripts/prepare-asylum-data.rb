#!/usr/bin/env ruby

require 'csv'
require 'json'
require 'iso_country_codes'

OUTPUT_FILE = './temp/data-assets/asylum.json'
INPUT_FILE = './data/unhcr_popstats_export_asylum_seekers_monthly_2015_09_20_EU_Africa_Middle_East.csv'
month_data = []
$country_codes_cache = {}

def get_country_code_for_name(name)
	$country_codes_cache[name] ||= IsoCountryCodes.search_by_name(name).first.alpha3
end

File.delete(OUTPUT_FILE) if File.exists?(OUTPUT_FILE)

CSV.foreach(INPUT_FILE) do |row|
  next if row[4] == '*'
  month_data << {
    oc: get_country_code_for_name(row[1]),
    ac: get_country_code_for_name(row[0]),
    month: Date::MONTHNAMES.index(row[3]),
    year: row[2].to_i,
    count: row[4].to_i
  }
end

File.open(OUTPUT_FILE, 'w') { |f| f.write(month_data.to_json) }
