#!/usr/bin/env node

/**
 * This is a script to update the data.json file from the OpenFlights repository.
 * It fetches the airports.dat file and parses its CSV content to JSON format.
 * For more information, see: https://openflights.org/data.html.
 */

const fs = require('fs');
const axios = require('axios');
const csv = require('csv-parse');

const url =
  'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';

const outputFilePath = 'src/lib/openflights/data.json';

const columns = [
  'id',
  'name',
  'city',
  'country',
  'iataCode',
  'icaoCode',
  'latitude',
  'longitude',
  'altitude',
  'timezoneOffset',
  'dst',
  'timezone',
  'type',
  'source',
];

const numberColumns = [
  'id',
  'latitude',
  'longitude',
  'altitude',
  'timezoneOffset',
];

const resultColumns = [
  'id',
  'name',
  'city',
  'country',
  'iataCode',
  'icaoCode',
  'latitude',
  'longitude',
  'altitude',
  'timezoneOffset',
  'dst',
  'timezone',
];

function pick(obj, props) {
  const result = {};

  for (const prop of props) {
    result[prop] = obj[prop];
  }

  return result;
}

async function main() {
  const { data } = await axios.get(url);

  const parser = csv.parse(data, {
    skipEmptyLines: true,
    columns,
    cast(value, context) {
      if (value === '\\N') return null;

      if (numberColumns.includes(context.column)) {
        return parseFloat(value);
      }

      return value;
    },
  });

  const records = [];

  for await (const record of parser) {
    records.push(pick(record, resultColumns));
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(records));
}

main().catch(process.stderr.write);
