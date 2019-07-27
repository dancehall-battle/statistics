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

module.exports = {
  filterLevel,
  filterAge
};