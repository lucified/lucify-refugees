#!/usr/bin/env ruby

require 'csv'
require 'json'
require 'set'
require 'iso_country_codes'

OUTPUT_FILE = './temp/data-assets/asylum.json'
INPUT_FILE = './data/unhcr_popstats_export_asylum_seekers_monthly.csv'
origin_countries_to_group_together = ["Stateless", "Various/unknown", "Tibetan", "USA (EOIR)", "USA (INS/DHS)"]
destination_countries_to_ignore = [
  "Canada", "Australia", "New Zealand", "Japan", "Rep. of Korea", "Turkey",
  "Stateless", "Various/unknown", "Tibetan", "USA (EOIR)", "USA (INS/DHS)"
]

$proper_country_names = {
  "Dem. Rep. of the Congo" => "Congo (Democratic Republic of the)",
  "Iran (Islamic Rep. of)" => "Iran (Islamic Republic of)",
  "Palestinian" => "Palestine, State of",
  "The former Yugoslav Rep. of Macedonia" => "Macedonia (the former Yugoslav Republic of)",
  "Rep. of Moldova" => "Moldova (Republic of)",
  "United Rep. of Tanzania" => "Tanzania, United Republic of",
  "Serbia and Kosovo (S/RES/1244 (1999))" => "Serbia",
  "Serbia and Kosovo: S/RES/1244 (1999)" => "Serbia",
  "Rep. of Korea" => "Korea (Republic of)",
  "Dem. People's Rep. of Korea" => "Korea (Democratic People's Republic of)",
  "Lao People's Dem. Rep." => "Lao People's Democratic Republic",
  "Czech Rep." => "Czechia",
  "China, Hong Kong SAR" => "Hong Kong",
  "China, Macao SAR" => "Macao"
}
month_data = []
grouped_monthly_data = Array.new(13){ |i| {} } # initialize with array of hashes. month counting starts at index 1
$country_codes_cache = {}


def proper_country_name(name)
  proper_name = $proper_country_names[name]
  proper_name = name.gsub(/Rep\./, 'Republic') unless proper_name
  proper_name
end

def get_country_code_for_name(name)
  $country_codes_cache[name] ||= IsoCountryCodes.search_by_name(name).first.alpha3
end

File.delete(OUTPUT_FILE) if File.exists?(OUTPUT_FILE)

CSV.foreach(INPUT_FILE, encoding: "UTF-8") do |row|
  next if row[4] == '*'
  next if destination_countries_to_ignore.include?(row[0])
  next if row[1] == row[0] # for some reason the data includes rows where
                           # the destination is the same as the source country
  year = row[2].to_i
  month = Date::MONTHNAMES.index(row[3])
  count = row[4].to_i
  asylum_country = get_country_code_for_name(proper_country_name(row[0]))

  if origin_countries_to_group_together.include?(row[1])
    unless grouped_monthly_data[month][year]
      grouped_monthly_data[month][year] = {}
    end
    grouped_monthly_data[month][year][asylum_country] = (grouped_monthly_data[month][year][asylum_country] || 0) + count
    next
  end

  month_data << {
    oc: get_country_code_for_name(proper_country_name(row[1])),
    ac: asylum_country,
    month: month,
    year: year,
    count: count
  }
end

grouped_monthly_data.each_with_index do |years, month|
  next if month == 0
  years.each do |year, asylum_countries|
    asylum_countries.each do |country, count|
      month_data << {
        oc: "XXX",
        ac: country, # group them under the "XXX" country code
        month: month,
        year: year,
        count: count
      }
    end
  end
end

month_data.sort! do |a, b|
  if a[:year] < b[:year]
    -1
  elsif a[:year] > b[:year]
    1
  elsif a[:month] < b[:month]
    -1
  elsif a[:month] > b[:month]
    1
  elsif a[:ac] == b[:ac]
    a[:oc] <=> b[:oc]
  else
    a[:ac] <=> b[:ac]
  end
end

File.open(OUTPUT_FILE, 'w') { |f| f.write(month_data.to_json) }
