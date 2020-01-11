const {getClient} = require('./lib/utils');

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
  const client = await getClient();
  const data = (await client.query({ query: queryAllEvents })).data;
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