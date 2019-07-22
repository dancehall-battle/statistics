const {Client} = require('graphql-ld/index');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');

// Define a JSON-LD context
const context = {
  "@context": {
    "label":  { "@id": "http://www.w3.org/2000/01/rdf-schema#label" },
    "name":  { "@id": "http://schema.org/name" },
    "start":  { "@id": "http://schema.org/startDate" },
    "end":    { "@id": "http://schema.org/endDate" },
    "location":    { "@id": "http://schema.org/location" },
    "hasWinner":    { "@id": "https://dancebattle.org/ontology/hasWinner" },
    "hasBattle":    {  "@id": "https://dancebattle.org/ontology/hasBattle" },
    "Event": { "@id": "https://dancebattle.org/ontology/DanceEvent" }
  }
};

// Create a GraphQL-LD client based on a client-side Comunica engine
const comunicaConfig = {
  sources: [
    { type: "hypermedia", value: "http://localhost:3000/output" },
  ],
};
const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });

// Define a query
const query = `
  query { ... on Event {
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
  // Execute the query
  const data = await executeQuery(query);
  let result = filterDates(data, new Date('2019-04-01'), new Date('2019-06-30'));
  //console.log(result);

  printAsCSV(countCountries(result));
}

async function executeQuery(query){
  const {data} = await client.query({ query });

  return data;
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