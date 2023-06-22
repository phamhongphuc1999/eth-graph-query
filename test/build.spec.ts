import * as tape from 'tape';
import QueryBuilder from '../src/query-builder';
import { QueryJson } from '../src/type';

const simpleWhereQuery: QueryJson = {
  key1: 'a',
  key2: 123,
  key3: { sub31: 'abc', sub32: 321 },
  key4: true,
  key5: ['1', '2', '3'],
  key6: { contains: 'abc', not: 123 },
  key7: { not_contains_nocase: 'starwar' },
};

tape('Build query', function (t) {
  t.test('Build json query', function (st) {
    const jsonQuery = QueryBuilder.buildJsonQuery(simpleWhereQuery);
    st.ok(jsonQuery.length);
    st.end();
  });
  t.test('Build query', function (st) {
    const query = QueryBuilder.buildQuery(
      {
        collection: 'collection1',
        params: {
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
        },
      },
      { elements: ['deployment', 'number'], blockQuery: { hash: '0x123' } },
    );
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
            { collection: 'collection3', params: { elements: ['element5', 'element6'] } },
          ],
          where: simpleWhereQuery,
          id: '123',
          orderBy: 'element1',
        },
      },
      {
        collection: 'collection2',
        params: {
          elements: ['element3', 'element4'],
          skip: 1000,
          block: { hash: '0x123', number: 1234 },
        },
      },
    ]);
    const fullQuery = QueryBuilder.makeFullQuery(query);
    st.ok(query.length);
    st.ok(fullQuery.length);
    st.end();
  });
});
