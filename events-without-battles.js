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

  // Define a query
  const queryAllEvents = `
  query {
    id @single
    name @single
    type(_:Event)
  }`;

  const queryEventsWithBattle = `
  query {
    id @single
    type(_:Event)
    hasBattle
  }`;

  // Execute the query
  const {data} = await client.query({ query: queryAllEvents });
  const data2 = (await client.query({ query: queryEventsWithBattle })).data;

  const eventsWithBattleIDs = data2.map(d => d.id);
  const filtered = data.filter(event => eventsWithBattleIDs.indexOf(event.id) === -1);

  printAsCSV(filtered);
}

function printAsCSV(data) {
  console.log(`id,name`);

  data.forEach(event => {
    console.log(`"${event.id}","${event.name}"`);
  });
}