const {getClient} = require('./lib/utils');

// Define a query
const query = `
  query {
    id @single
    type(_:DanceEvent)
    start @single
    end @single
  }`;

main();

const years = {};

async function main() {
  const client = await getClient();
  const events = (await client.query({ query })).data;

  events.forEach(event => {
    if ((new Date(event.start)) <= new Date()) {
      const start = (new Date(event.start)).getFullYear();
      const end = (new Date(event.end)).getFullYear();

      addYear(start);

      if (start !== end) {
        addYear(end);
      }
    }
  });

  printAsCSV(years);
}

function addYear(year) {
  if (!years[year]) {
    years[year] = 0;
  }

  years[year] ++;
}

function printAsCSV(data) {
  console.log(`year,# events`);

  const years = Object.keys(data);

  years.forEach(year => {
    console.log(`${year},${data[year]}`);
  });
}
