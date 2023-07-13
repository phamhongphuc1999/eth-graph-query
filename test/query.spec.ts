import { assert, describe, it } from 'vitest';
import { EthGraphQuery } from '../src';

describe('Eth graph query', () => {
  const root = 'https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet';
  const query = new EthGraphQuery(root);

  it('Test parameters', () => {
    assert.equal(query.root, root);
  });
  it('Test simple query', async () => {
    let result = await query.query({ collection: 'pools', params: { first: 10 } });
    assert.equal(result['errors'], undefined);
    result = await query.fetch(`query MyQuery {
      pools(first: 10) {
        id
      }
    }`);
    assert.equal(result['errors'], undefined);
  });
  it('Test ethereum address query', async () => {
    const result = await query.query({
      collection: 'pools',
      params: {
        elements: [
          'id',
          {
            collection: 'closedAllocations',
            params: { where: { id: '0x02353e9c1d14fe8e3eccf316fe6dde4aaf43cf58' } },
          },
        ],
      },
    });
    assert.equal(result['errors'], undefined);
  });
  it('Test query with inline fragments', async () => {
    const result = await query.query({
      collection: 'transactions',
      params: {
        elements: ['id'],
        inlineFragments: [
          { collection: 'BridgeDepositTransaction', params: { elements: ['id', 'l1Token'] } },
          { collection: 'NameSignalTransaction', params: { elements: ['id', 'timestamp'] } },
        ],
      },
    });
    assert.equal(result['errors'], undefined);
  });
  it('Test complex query', async () => {
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
    assert.equal(result['errors'], undefined);
  });
  it('Test more detail situation', async () => {
    const result = await query.query({
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
    assert.equal(result['errors'], undefined);
    assert.ok(result['data']);
    assert.ok(result['data']['pools']);
    assert.ok(result['data']['pools'].length == 0);
  });
});
