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
  const queryAllBattles = `
  query {
    id @single
    end
    type(_:Battle)
  }`;

  const queryBattlesWithWinners = `
  query {
    id @single
    type(_:Battle)
    hasWinner
  }`;

  // Execute the query
  const today = new Date();
  const data = (await client.query({ query: queryAllBattles})).data.filter(event => new Date(event.end) < today);
  const data2 = (await client.query({ query: queryBattlesWithWinners})).data;

  const battlesWithWinnersIDs = data2.map(d => d.id);
  const filtered = data.filter(event => battlesWithWinnersIDs.indexOf(event.id) === -1);

  printAsCSV(filtered);
}

function printAsCSV(data) {
  console.log(`id,date`);

  data.forEach(battle => {
    console.log(`"${battle.id}","${battle.end}"`);
  });
}