/* eslint-disable import/no-unresolved */
import * as tape from 'tape';
import { EthGraphQuery } from '../src/index.js';

tape('Eth graph query', function (t) {
  const root = 'https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet';
  const query = new EthGraphQuery(root);
  t.test('Test parameters', async function (st) {
    st.equal(query.root, root);
    st.end();
  });
  t.test('Test simple query', async function (st) {
    const result = await query.query({ collection: 'pools', params: { first: 10 } });
    st.equal(result['errors'], undefined);
    st.end();
  });
  t.test('Test ethereum address query', async function (st) {
    const result = await query.query(
      {
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
      },
      {
        elements: ['hash'],
        blockQuery: { hash: '0xa005448da8cfdf40d34ab6f81c0100e9faac6ab942b435e9a0150505ba31df44' },
      },
    );
    st.equal(result['errors'], undefined);
    st.end();
  });
  t.test('Test complex query', async function (st) {
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
    st.equal(result['errors'], undefined);
    st.end();
  });
});
