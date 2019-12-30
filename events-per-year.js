const {Client} = require('graphql-ld/index');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const fs = require('fs-extra');
const path = require('path');

main();

const years = {};

async function main() {
  const context = {
    "@context": await fs.readJson(path.resolve(__dirname, './context.json'))
  };

  // Create a GraphQL-LD client based on a client-side Comunica engine
  const comunicaConfig = {
    sources: require('./sources')
  };
  const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });

  // Define a query
  const query = `
  query {
    id @single
    type(_:Event)
    start @single
    end @single
  }`;

  // Execute the query
  const events = (await client.query({ query })).data;

  events.forEach(event => {
    if ((new Date(event.start)) <= new Date()) {
      const start = (new Date(event.start)).getFullYear();
      const end = (new Date(event.end)).getFullYear();

      addYear(start);

      if (start !== end) {
        addYear(end);
      }
    }
  });

  printAsCSV(years);
}

function addYear(year) {
  if (!years[year]) {
    years[year] = 0;
  }

  years[year] ++;
}

function printAsCSV(data) {
  console.log(`year,# events`);

  const years = Object.keys(data);

  years.forEach(year => {
    console.log(`${year},${data[year]}`);
  });
}
