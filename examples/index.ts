/* eslint-disable no-console */
import { EthGraphQuery } from '../src';

async function run() {
  console.log('---Run examples/index.ts---');
  const query = new EthGraphQuery('https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet');
  const result = await query.mergeQuery([
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
          id: { lte: '10' },
        },
        first: 10,
      },
    },
  ]);
  console.log(result);
}

run();
