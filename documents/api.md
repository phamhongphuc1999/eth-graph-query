<h1>
eth-graph-query
</h1>

The idea when creating this package is trying to use `json format` for creating a query with `string format` to [the graph](https://thegraph.com/)

## Modules

- [EthGraphQuery](https://github.com/phamhongphuc1999/eth-graph-query/blob/main/src/index.ts)

  - async stringQuery<T>(data: string): Given query string, returns the data respective with it.
  - async query<T = any>(data: [GraphObject](#graphobject), metadata?: [Metadata](#metadata)): fetch data with a single query
  - async multipleQuery<T = any>(data: Array<[GraphObject](#graphobject)>, metadata?: [Metadata](#metadata)): fetch data with a multiple query

- static [QueryBuilder](https://github.com/phamhongphuc1999/eth-graph-query/blob/main/src/query-builder.ts)
  - buildJsonQuery(query: [QueryJson](#query_json)): build json string format
  - buildElements(elements: Array<[ElementType](#element_type)>): build elements array string format
  - buildMetadata(metadata: [Metadata](#metadata)): build metadata
  - buildInlineFragments(fragments: Array<[InlineFragmentType](#inline_fragment_type)>): build inline fragment
  - buildQuery(data: [GraphObject](#graphobject), metadata?: [Metadata](#metadata)): build a single query
  - buildMultipleQuery(data: Array<[GraphObject](#graphobject)>, metadata?: [Metadata](#metadata)): build a multiple query
  - makeFullQuery(query: string): create final query

## API

### GraphObject <a name="graphobject"></a>

- Package graph params, it is a simple json format with two elements

```shell
{
  collection: string;
  params?: GraphParams;
}
```

### GraphParams <a name="graph_params"></a>

- `GraphParams` is represented to `the graph query`.

| id  | key             | type                                               | description                                                                                           |
| :-- | :-------------- | :------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| 1   | elements        | Array<[ElementType](#element_type)>                | Elements you want to fetch in target collection                                                       |
| 2   | inlineFragments | Array<[InlineFragmentType](#inline_fragment_type)> | Inline fragment                                                                                       |
| 3   | where           | [QueryJson](#query_json)                           | Representing to all filter command(you can consider that `where` is like to `WHERE` in `SQL` command) |
| 4   | id              | string                                             | Id of document(it is like a special filter)                                                           |
| 5   | first           | number                                             | If `first` is provided, `query command` only fetch up to `first` documents                            |
| 6   | orderBy         | string                                             | If `orderBy` is provided, the result data will be sort by `orderBy`                                   |
| 7   | orderDirection  | 'asc' or 'desc'                                    | the order direction, it can be asc or desc                                                            |
| 8   | skip            | number                                             | The result data will skip `skip` documents if `skip` is provided                                      |
| 9   | subgraphError   | 'allow' or 'deny'                                  |                                                                                                       |
| 10  | block           | [BlockQuery](#block_query)                         |                                                                                                       |

### ElementType <a name="element_type"></a>

- Representing `json format` elements in query command. In the graphql, user can query some elements in document by providing it's name. A element in document can get normal type(number, boolean, string,...) or it is a complex type represented that another document.

- `ElementType` can get two types: string or { collection: string; params?: [GraphParams](#graph_params) }. If element get a normal type, `ElementType` will get string type. On the other hand, `ElementType` will get { collection: string; params?: [GraphParams](#graph_params) } if element represented another document.

### QueryJson <a name="query_json"></a>

- `QueryJson` is `json format` that represented the filter of graph query. I divide `QueryJson` into two sub-query command. I name them are `normal query` and `option query`.

- `normal query` will query documents that have `element` that get the value provided in `normal query`.

```js
const query = new EthGraphQuery(root);
const result = await query.query({
  collection: 'collection1',
  params: {
    elements: ['element1', 'element2'],
    where: { element1: '1234' },
  },
});
```

- In above example, a query will get all documents that have element1 equal 1234. In more complex case, `option query` create a more complicated that `normal`.

```js
const result = await query.query({
  collection: 'collection1',
  params: {
    elements: ['element1', 'element2'],
    where: { element1: '1234', id: { $in: ['0x1234', '0x4321'] } },
  },
});
```

- In above example, the query will get all documents that have element1 equal 1234. Moreover, the id of documents has to get `0x1234` or `0x4321`. Graphql support some operators

| id  | operator               |
| :-- | :--------------------- |
| 1   | contains               |
| 2   | contains_nocase        |
| 3   | ends_with              |
| 4   | end_with_nocase        |
| 5   | starts_with            |
| 6   | starts_with_nocase     |
| 7   | not_contains           |
| 8   | not_contains_nocase    |
| 9   | not_ends_with          |
| 10  | not_ends_with_nocase   |
| 11  | not_starts_with        |
| 12  | not_starts_with_nocase |
| 13  | gt                     |
| 14  | gte                    |
| 15  | lt                     |
| 16  | lte                    |
| 17  | not                    |
| 18  | in                     |
| 19  | not_in                 |

### BlockQuery <a name="block_query"></a>

- `BlockQuery` is block query of graph query. If you define it, you can get the data in a particular block number or block hash.

### Metadata <a name="metadata"></a>

- `Metadata` is metadata you can query in a query command.

#### InlineFragmentType <a name="inline_fragment_type"></a>

- You can use inline fragment

```js
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
```
