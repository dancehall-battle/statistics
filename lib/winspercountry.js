const {Client} = require('graphql-ld/index');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const {filterLevel, filterAge} = require('./utils');

// Define a JSON-LD context
const context = {
  "@context": {
    "name":  { "@id": "http://schema.org/name" },
    "start":  { "@id": "http://schema.org/startDate" },
    "end":    { "@id": "http://schema.org/endDate" },
    "location":    { "@id": "http://schema.org/location" },
    "wins":    { "@reverse": "https://dancebattle.org/ontology/hasWinner" },
    "country":    { "@id": "https://dancebattle.org/ontology/representsCountry" },
    "level":    { "@id": "https://dancebattle.org/ontology/level" },
    "age":    { "@id": "https://dancebattle.org/ontology/age" },
    "hasBattle":    {  "@id": "https://dancebattle.org/ontology/hasBattle" },
    "atEvent":    {  "@reverse": "https://dancebattle.org/ontology/hasBattle" },
    "participants":    {  "@id": "https://dancebattle.org/ontology/amountOfParticipants" },
    "Dancer":    {  "@id": "https://dancebattle.org/ontology/Dancer" }
  }
};

// Create a GraphQL-LD client based on a client-side Comunica engine
const comunicaConfig = {
  sources: require('../sources')
};
const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });

// Define a query
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
  // Execute the query
  const data = await executeQuery(query);
  //console.log(data);
  let result = filterLevel(data);
  result = filterAge(result);
  result = filterParticipants(result, amountOfParticipants);
  result = filterDates(result, new Date('2019-04-01'), new Date('2019-06-30'));
  result = mapToCountries(result);
  //console.log(result);
  //console.log(countCountries(result));

  printAsCSV(result);
}

async function executeQuery(query){
  const {data} = await client.query({ query });

  return data;
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