/* eslint-disable no-console */
import { EthGraphQuery } from '../src/index.js';

async function run() {
  console.log('---Run examples/index.ts---');
  const query = new EthGraphQuery(
    'https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet',
  );
  const result1 = await query.query([
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
              elements: [
                'id',
                'poi',
                { collection: 'indexer', params: { elements: ['id'], first: 10 } },
              ],
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
  console.log(result1);
  console.log('=======');
  const result2 = await query.query({
    collection: 'pools',
    params: {
      elements: [
        'id',
        {
          collection: 'closedAllocations',
          params: {
            elements: ['id', 'closedAtBlockNumber'],
            first: 1,
          },
        },
      ],
      where: { id: { $lte: 1, $gte: 1 } },
    },
  });
  console.log(result2);
}

run();
