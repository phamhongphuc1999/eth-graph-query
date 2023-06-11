import * as tape from 'tape';
import EthGraphQuery from '../src';

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
} catch (error) {
  console.error(error);
}

tape('Eth graph query', function (t) {
  const root = process.env.TEST_API_ROOT ?? '';
  const query = new EthGraphQuery(root);
  t.test('Test parameters', async function (st) {
    st.equal(query.root, root);
    st.end();
  });
  t.test('Test simple query', async function (st) {
    const result = await query.query('commissions', { elements: ['id'] });
    st.ok(result);
    st.end();
  });
  t.test('Test ethereum address query', async function (st) {
    const result = await query.query('users', { where: { id: '0x595622cbd0fc4727df476a1172ada30a9ddf8f43' } });
    st.ok(result);
    st.end();
  });
  t.test('Test complex query', async function (st) {
    const result = await query.mergeQuery([
      {
        collection: 'users',
        params: {
          elements: ['id', 'totalCommission'],
          where: { id_in: ['0x595622cbd0fc4727df476a1172ada30a9ddf8f43'] },
        },
      },
      { collection: 'quizs', params: { elements: ['epoch', 'id', 'players'], where: { id_in: ['1', '2'] } } },
    ]);
    st.ok(result);
    st.end();
  });
});
