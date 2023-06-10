import * as test from 'tape';
import QueryBuilder from '../src/query-builder';

const simpleWhereQuery = {
  key1: 'a',
  key2: 123,
  key3: {
    sub31: 'abc',
    sub32: 321,
  },
  key4: true,
};

test('Build query', function (t) {
  t.test('Build json query', function (st) {
    const jsonQuery = QueryBuilder.buildJsonQuery(simpleWhereQuery);
    st.ok(jsonQuery.length);
    st.end();
  });
  t.test('Build query', function (st) {
    const query = QueryBuilder.buildQuery('collection1', {
      elements: ['element1', 'element2'],
      where: simpleWhereQuery,
      id: '123',
      orderBy: 'element1',
      orderDirection: 'asc',
      skip: 100,
      subgraphError: 'allow',
      block: {
        hash: '123456789',
      },
    });
    const fullQuery = QueryBuilder.makeFullQuery(query);
    st.ok(query.length);
    st.ok(fullQuery.length);
    st.end();
  });
});
