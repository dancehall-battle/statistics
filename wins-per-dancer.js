const {Client} = require('graphql-ld/index');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {filterLevel, filterAge}  = require('./lib/utils');
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

// Define a query
  const query = `
  query { ... on Dancer {
    name @single
    wins {
      level @single
      start @single
      end @single
      age @single
    }
    }
  }`;

  // Execute the query
  const {data} = await client.query({ query });
  //console.log(data);
  let result = filterLevel(data);
  result = filterAge(result);
  result = filterDates(result, new Date('2019-10-01'), new Date('2019-12-31'));
  //console.log(result);

  printAsCSV(result);
}

function filterDates(dancers, startDate, endDate) {
  dancers.forEach(dancer => {
    //console.log(dancer.wins);
    dancer.wins = dancer.wins.filter(battle => (new Date(battle.start)) >= startDate && (new Date(battle.end)) <= endDate).length;
  });

  // TODO put this in separate method.
  dancers = dancers.filter(dancer => dancer.wins > 0);

  return dancers;
}

function printAsCSV(data) {
  console.log(`dancer,wins`);

  data.forEach(dancer => {
    console.log(`${dancer.name},${dancer.wins}`);
  });
}