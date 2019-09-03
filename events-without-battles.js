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
    "hasBattle":    { "@id": "https://dancebattle.org/ontology/hasBattle" },
    "type":    { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
    "DanceEvent": { "@id": "https://dancebattle.org/ontology/DanceEvent" }
  }
};

// Create a GraphQL-LD client based on a client-side Comunica engine
const comunicaConfig = {
  sources: require('./sources')
};
const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });

// Define a query
const queryAllEvents = `
  query {
    id @single
    name @single
    type(_:DanceEvent)
  }`;

const queryEventsWithBattle = `
  query {
    id @single
    type(_:DanceEvent)
    hasBattle
  }`;

main();

async function main() {
  // Execute the query
  const data = await executeQuery(queryAllEvents);
  const data2 = await executeQuery(queryEventsWithBattle);

  const eventsWithBattleIDs = data2.map(d => d.id);
  const filtered = data.filter(event => eventsWithBattleIDs.indexOf(event.id) === -1);

  printAsCSV(filtered);
}

async function executeQuery(query){
  const {data} = await client.query({ query });

  return data;
}

function printAsCSV(data) {
  console.log(`id,name`);

  data.forEach(event => {
    console.log(`"${event.id}","${event.name}"`);
  });
}