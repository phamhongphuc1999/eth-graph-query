/* eslint-disable no-console */
import { QueryBuilder } from '../src/index.js';

function run() {
  const result1 = QueryBuilder.buildJsonQuery({
    key1: 'a',
    key2: 123,
    key3: { sub31: 'abc', sub32: 321 },
    key4: true,
    key5: ['1', '2', '3'],
    key6: { $contains: 'abc', $not: 123 },
    key7: { $not_contains_nocase: 'starwar' },
  });
  console.log(result1);
  console.log('=======');
  const result2 = QueryBuilder.mergeQuery([
    { collection: 'networks', params: { first: 10 } },
    {
      collection: 'pools',
      params: {
        elements: [
          'id',
          'claimedFees',
          {
            collection: 'closedAllocations',
            params: {
              elements: ['id', 'poi', { collection: 'indexer', params: { elements: ['id'], first: 10 } }],
              first: 10,
            },
          },
        ],
        where: {
          id: { $lte: '10' },
        },
        first: 10,
      },
    },
  ]);
  console.log(result2);
}

run();
