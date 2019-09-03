const {Client} = require('graphql-ld/index');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {filterLevel, filterAge}  = require('./lib/utils');

// Define a JSON-LD context
const context = {
  "@context": {
    "name":  { "@id": "http://schema.org/name" },
    "start":  { "@id": "http://schema.org/startDate" },
    "end":    { "@id": "http://schema.org/endDate" },
    "wins":    { "@reverse": "https://dancebattle.org/ontology/hasWinner" },
    "level":    { "@id": "https://dancebattle.org/ontology/level" },
    "age":    { "@id": "https://dancebattle.org/ontology/age" },
    "Dancer": { "@id": "https://dancebattle.org/ontology/Dancer" }
  }
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


main();

async function main() {
  // Execute the query
  const data = await executeQuery(query);
  //console.log(data);
  let result = filterLevel(data);
  result = filterAge(result);
  result = filterDates(result, new Date('2019-04-01'), new Date('2019-06-30'));
  //console.log(result);

  printAsCSV(result);
}

async function executeQuery(query){
  const {data} = await client.query({ query });

  return data;
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