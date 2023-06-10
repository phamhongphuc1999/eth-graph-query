import * as test from 'tape';
import EthGraphQuery from '../src';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

test('Eth graph query', function (t) {
  const root = process.env.TEST_API_ROOT ?? '';
  const query = new EthGraphQuery(root);
  t.test('Test parameters', async function (st) {
    st.equal(query.root, root);
    st.end();
  });
  t.test('Test query', async function (st) {
    const result = await query.query('commissions', { elements: ['id'] });
    st.ok(result);
  });
});
