const {Client} = require('graphql-ld/index');
const {QueryEngineComunica} = require('graphql-ld-comunica/index');
const fs = require('fs-extra');
const path = require('path');

function filterLevel(dancers) {
  dancers.forEach(dancer => {
    dancer.wins = dancer.wins.filter(battle => battle.level === 'pro' || battle.level === 'all');
  });

  return dancers;
}

function filterAge(dancers) {
  dancers.forEach(dancer => {
    dancer.wins = dancer.wins.filter(battle => battle.age === '');
  });

  return dancers;
}

async function getClient() {
  const comunicaConfig = {
    sources:  await fs.readJson(path.resolve(__dirname, 'sources.json'))
  };
  const context = {
    '@context': await fs.readJson(path.resolve(__dirname, 'context.json'))
  };

  return new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });
}

module.exports = {
  filterLevel,
  filterAge,
  getClient
};