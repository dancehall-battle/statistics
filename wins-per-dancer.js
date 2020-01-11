const {getClient} = require('./lib/utils');
const {filterLevel, filterAge}  = require('./lib/utils');

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
  const client = await getClient();
  const data = (await client.query({ query })).data;
  //console.log(data);
  let result = filterLevel(data);
  result = filterAge(result);
  result = filterDates(result, new Date('2019-07-01'), new Date('2019-09-30'));
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