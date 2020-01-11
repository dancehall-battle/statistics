const {getClient} = require('./utils');
const {filterLevel, filterAge} = require('./utils');

const query = `
  query { ... on Dancer {
    name @single # TODO use the IRI here
    country @single
    wins {
      level @single
      age @single
      start @single
      end @single
      participants @single
      atEvent @single {
        location @single
      }
    }
    }
  }`;

async function main(amountOfParticipants) {
  const client = await getClient();
  const data = (await client.query({ query })).data;
  //console.log(data);
  let result = filterLevel(data);
  result = filterAge(result);
  result = filterParticipants(result, amountOfParticipants);
  result = filterDates(result, new Date('2019-07-01'), new Date('2019-09-30'));
  result = mapToCountries(result);
  //console.log(result);
  //console.log(countCountries(result));

  printAsCSV(result);
}

function filterDates(dancers, startDate, endDate) {
  dancers.forEach(dancer => {
    //console.log(dancer.wins);
    dancer.wins = dancer.wins.filter(battle => (new Date(battle.start)) >= startDate && (new Date(battle.end)) <= endDate);
  });

  return dancers;
}

function mapToCountries(data) {
  const countries = {};

  data.forEach(d => {
    if (d.wins.length > 0) {
      if (!countries[d.country]) {
        countries[d.country] = {
          wins: 0,
          locations: []
        };
      }

      countries[d.country].wins += d.wins.length;

      d.wins.forEach(win => {
        if (countries[d.country].locations.indexOf(win.atEvent.location) === -1) {
          countries[d.country].locations.push(win.atEvent.location);
        }
      });
    }
  });

  return countries;
}

function filterParticipants(dancers, amountOfParticipants) {
  dancers.forEach(dancer => {
    //console.log(dancer.wins);
    dancer.wins = dancer.wins.filter(battle => {
      if (!amountOfParticipants) {
        return battle.participants === '1' || battle.participants === '2';
      } else {
        return battle.participants === ('' + amountOfParticipants);
      }
    });
  });

  return dancers;
}

function printAsCSV(data) {
  console.log(`country,wins,locations`);
  const keys = Object.keys(data);

  keys.forEach(k => {
    console.log(`${k},${data[k].wins},"${data[k].locations.join(',')}"`);
  });
}

module.exports = main;
