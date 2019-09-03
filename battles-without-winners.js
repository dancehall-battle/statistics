const {Client} = require('graphql-ld/index');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {filterLevel, filterAge}  = require('./lib/utils');

// Define a JSON-LD context
const context = {
  "@context": {
    "name":  { "@id": "http://schema.org/name" },
    "start":  { "@id": "http://schema.org/startDate" },
    "end":    { "@id": "http://schema.org/endDate" },
    "hasWinner":    { "@id": "https://dancebattle.org/ontology/hasWinner" },
    "level":    { "@id": "https://dancebattle.org/ontology/level" },
    "age":    { "@id": "https://dancebattle.org/ontology/age" },
    "hasBattle":    { "@id": "https://dancebattle.org/ontology/hasBattle" },
    "type":    { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
    "DanceBattle": { "@id": "https://dancebattle.org/ontology/DanceBattle" }
  }
};

// Create a GraphQL-LD client based on a client-side Comunica engine
const comunicaConfig = {
  sources: require('./sources')
};
const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });

// Define a query
const queryAllBattles = `
  query {
    id @single
    end
    type(_:DanceBattle)
  }`;

const queryBattlesWithWinners = `
  query {
    id @single
    type(_:DanceBattle)
    hasWinner
  }`;

main();

async function main() {
  // Execute the query
  const today = new Date();
  const data = (await executeQuery(queryAllBattles)).filter(event => new Date(event.end) < today);
  const data2 = await executeQuery(queryBattlesWithWinners);

  const battlesWithWinnersIDs = data2.map(d => d.id);
  const filtered = data.filter(event => battlesWithWinnersIDs.indexOf(event.id) === -1);

  printAsCSV(filtered);
}

async function executeQuery(query){
  const {data} = await client.query({ query });

  return data;
}

function printAsCSV(data) {
  console.log(`id,date`);

  data.forEach(battle => {
    console.log(`"${battle.id}","${battle.end}"`);
  });
}