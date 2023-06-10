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
  key5: ['1', '2', '3'],
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
  t.test('Merge query', function (st) {
    const query = QueryBuilder.mergeQuery([
      {
        collection: 'collection1',
        params: {
          elements: [
            'element1',
            'element2',
            QueryBuilder.buildQuery('collection3', { elements: ['element5', 'element6'] }),
          ],
          where: simpleWhereQuery,
          id: '123',
          orderBy: 'element1',
        },
      },
      {
        collection: 'collection2',
        params: { elements: ['element3', 'element4'], skip: 1000, block: { hash: '0x123', number: 1234 } },
      },
    ]);
    const fullQuery = QueryBuilder.makeFullQuery(query);
    st.ok(query.length);
    st.ok(fullQuery.length);
    st.end();
  });
});
