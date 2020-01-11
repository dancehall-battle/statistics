const {getClient} = require('./lib/utils');

// Define a query
const query = `
  query { ... on DanceEvent {
    location @single
    name @single
    hasBattle {
      start @single
      end @single
      hasWinner #only select battles for which we know the winner
    }
    }
  }`;

main();

async function main() {
  const client = await getClient();
  const data = (await client.query({ query })).data;
  let result = filterDates(data, new Date('2019-07-01'), new Date('2019-09-30'));
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
