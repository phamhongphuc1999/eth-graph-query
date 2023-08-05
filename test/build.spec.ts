import { assert, describe, it } from 'vitest';
import { QueryBuilder } from '../src/query-builder.js';
import { QueryJson } from '../src/type.js';

const simpleWhereQuery: QueryJson = {
  key1: 'a',
  key2: 123,
  key3: { sub31: 'abc', sub32: 321 },
  key4: true,
  key5: ['1', '2', '3'],
  key6: { $contains: 'abc', $not: 123 },
  key7: { $not_contains_nocase: 'starwar' },
};

describe('Build query', () => {
  it('Build json query', () => {
    const jsonQuery = QueryBuilder.buildJsonQuery(simpleWhereQuery);
    assert.notOk(jsonQuery.includes('{}'));
    assert.ok(jsonQuery.includes('key7_not_contains_nocase'));
    assert.ok(jsonQuery.includes('key6_contains'));
    assert.ok(jsonQuery.includes('key6_not'));
  });
  it('Build query', () => {
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
    assert.notOk(query.includes('{}'));
    assert.ok(query.includes('["1", "2", "3"]'));
    assert.ok(fullQuery.includes('query query'));
  });
  it('Build wih inline fragments', () => {
    const query = QueryBuilder.buildQuery({
      collection: 'networks',
      params: {
        elements: ['element1', 'element2'],
        inlineFragments: [
          { collection: 'inline1', params: { elements: ['inline11', 'inline12'] } },
          { collection: 'inline2', params: { elements: ['inline21', 'inline22'] } },
        ],
      },
    });
    const fullQuery = QueryBuilder.makeFullQuery(query);
    assert.notOk(query.includes('{}'));
    assert.ok(query.includes('... on'));
    assert.ok(fullQuery.includes('query query'));
  });
  it('Merge query', () => {
    const query = QueryBuilder.buildMultipleQuery([
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
    assert.notOk(query.includes('{}'));
    assert.ok(fullQuery.includes('query query'));
  });
  it('Array with $in', () => {
    const query = QueryBuilder.buildQuery({
      collection: 'collection1',
      params: {
        elements: [
          'id',
          {
            collection: 'subCollection1',
            params: { where: { buyer: null, token_: { setId: { $in: [0, 1, 2] } } } },
          },
        ],
        where: { id: { $in: ['0x123', '0x456'] }, element1: { $lte: 3 } },
      },
    });
    assert.notOk(query.includes('{}'));
    assert.ok(query.includes('null'));
    assert.ok(query.includes('["0x123", "0x456"]'));
  });
});
