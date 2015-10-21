#!/usr/bin/env ruby

## NOTE: This script is currently not used

require 'csv'
require 'json'

OUTPUT_FILE = './temp/data-assets/regional-movements.json'
INPUT_FILES = [
  {
    filename: "./data/syria-refugees-egypt-150705.csv",
    source_country: "SYR",
    destination_country: "EGY"
  },
  {
    filename: "./data/syria-refugees-iraq-150829.csv",
    source_country: "SYR",
    destination_country: "IRQ"
  },
  {
    filename: "./data/syria-refugees-lebanon-150825.csv",
    source_country: "SYR",
    destination_country: "LBN"
  },
  {
    filename: "./data/syria-refugees-turkey-150825.csv",
    source_country: "SYR",
    destination_country: "TUR"
  },
  {
    filename: "./data/syria-refugees-jordan-150906.csv",
    source_country: "SYR",
    destination_country: "JOR"
  }
]

#TODO: Iraqis in Jordan?

def month_difference(earlier_date, later_date)
  (later_date.year * 12 + later_date.month) - (earlier_date.year * 12 + earlier_date.month)
end

File.delete(OUTPUT_FILE) if File.exists?(OUTPUT_FILE)

month_data = []

INPUT_FILES.each do |country|
  previous_people_count = 0
  previous_date = nil

  csv_data = CSV.parse(File.read(country[:filename]), col_sep: ';')
  csv_data = csv_data.reverse.uniq { |row|
    date = Date.parse(row[0])
    Date.new(date.year, date.month, 1) # only leave one row per month
  }.reverse # double reverse lets us store the last available data of the month, not the first
  csv_data.each do |row|
    date = Date.parse(row[0])
    registered_people = row[1].to_i

    if previous_people_count == 0
      previous_people_count = registered_people
      previous_date = date
    end

    # if there's a missing month in between, interpolate data
    while (month_difference(previous_date, date) > 1)
      monthly_change = (registered_people - previous_people_count) / month_difference(previous_date, date)
      previous_people_count += monthly_change.to_i
      previous_date = previous_date.next_month

      month_data << {
        oc: country[:source_country],
        ac: country[:destination_country],
        month: previous_date.month,
        year: previous_date.year,
        count: monthly_change.to_i
      }
    end

    month_data << {
      oc: country[:source_country],
      ac: country[:destination_country],
      month: date.month,
      year: date.year,
      count: registered_people - previous_people_count
    }

    previous_date = date
    previous_people_count = registered_people
  end
end

File.open(OUTPUT_FILE, 'w') { |f| f.write(month_data.to_json) }
