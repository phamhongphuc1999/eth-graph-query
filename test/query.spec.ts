import * as tape from 'tape';
import CoreGraphQuery from '../src';

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
} catch (error) {
  console.error(error);
}

tape('Eth graph query', function (t) {
  const root = process.env.TEST_API_ROOT ?? '';
  const query = new CoreGraphQuery(root);
  t.test('Test parameters', async function (st) {
    st.equal(query.root, root);
    st.end();
  });
  t.test('Test simple query', async function (st) {
    const result = await query.query('commissions', { elements: ['id'] });
    st.false('errors' in result);
    st.end();
  });
  t.test('Test ethereum address query', async function (st) {
    const result = await query.query('users', { where: { id: '0x595622cbd0fc4727df476a1172ada30a9ddf8f43' } });
    st.false('errors' in result);
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
      {
        collection: 'quizs',
        params: {
          elements: ['epoch', 'id', 'players', { collection: 'userSubmits', params: { elements: ['epoch', 'id'] } }],
          where: {
            id: { in: ['0', '1', '2'] },
            userSubmits_: { id: '0x162803573c7748ef7bbe9cd163cf0eaa2d97eff90962325b252ca30ac8f7e33e' },
          },
        },
      },
    ]);
    st.false('errors' in result);
    st.end();
  });
});
