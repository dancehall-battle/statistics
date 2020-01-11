const {getClient} = require('./lib/utils');

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
  const client = await getClient();
  const today = new Date();
  const data = (await client.query({ query: queryAllBattles })).data.filter(event => new Date(event.end) < today);
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