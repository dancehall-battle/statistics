const {Client} = require('graphql-ld/index');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const fs = require('fs-extra');
const path = require('path');

main();

async function main() {
  const context = {
    "@context": await fs.readJson(path.resolve(__dirname, './context.json'))
  };

  // Create a GraphQL-LD client based on a client-side Comunica engine
  const comunicaConfig = {
    sources: require('./sources')
  };
  const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });
  const query = `
  query { ... on Event {
    location @single
    name @single
    hasBattle {
      start @single
      end @single
      hasWinner #only select battles for which we know the winner
    }
    }
  }`;

  // Execute the query
  const {data} = await client.query({ query });
  let result = filterDates(data, new Date('2019-10-30'), new Date('2019-12-31'));
  //console.log(result);

  printAsCSV(countCountries(result));
}

function filterDates(events, startDate, endDate) {
  return events.filter(event => (new Date(event.hasBattle[0].start)) >= startDate && (new Date(event.hasBattle[0].end)) <= endDate);
}

function countCountries(data) {
  const countries = {};

  data.forEach(d => {
    if (!countries[d.location]) {
      countries[d.location] = 0;
    }

    countries[d.location] ++;
  });

  return countries;
}

function printAsCSV(data) {
  console.log(`country,events`);

  const keys = Object.keys(data);

  keys.forEach(k => {
    console.log(`${k},${data[k]}`);
  });
}
