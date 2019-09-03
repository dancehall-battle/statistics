# Statistics for knowledge graph

## Requirements
- Node js
- yarn

## Install
Install dependencies via `yarn install`.

## Usage

Execute a query via the corresponding script:

- `wins-per-country-1vs1.js`: the number of wins in the category 1 vs 1 per country.
- `wins-per-country-2vs2.js`: the number of wins in the category 2 vs 2 per country.
- `wins-per-country-all.js`: the number of wins in the categories 1 vs 1 and 2 vs 2 per country.
- `wins-per-dancer.js`: the number of wins in the categories 1 vs 1 and 2 vs 2 per dancer.
- `events-per-country.js`: the number of events organized per country.
- `battles-without-winners.js`: the battles that are over, but don't have a winner yet.
- `events-without-battles.js`: the events that don't have at least one battle linked.

The results are outputted as CSV to `stdout`.

## License

MIT &copy; Dancehall Battle