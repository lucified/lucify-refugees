#!/usr/bin/env ruby

require 'csv'
require 'json'
require 'iso_country_codes'

OUTPUT_FILE = './data/asylum.json'
INPUT_FILE = './data/unhcr_popstats_export_asylum_seekers_monthly.csv'
month_data = []

File.delete(OUTPUT_FILE) if File.exists?(OUTPUT_FILE)

CSV.foreach(INPUT_FILE) do |row|
  next if row[4] == '*'
  month_data << {
    oc: IsoCountryCodes.search_by_name(row[1]).first.alpha3,
    ac: IsoCountryCodes.search_by_name(row[0]).first.alpha3,
    month: Date::MONTHNAMES.index(row[3]),
    year: row[2].to_i,
    count: row[4].to_i
  }
end

File.open(OUTPUT_FILE, 'w') { |f| f.write(month_data.to_json) }
