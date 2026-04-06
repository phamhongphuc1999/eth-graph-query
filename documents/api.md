# eth-graph-query

This package builds GraphQL queries using JSON and provides a lightweight client. It supports The Graph conventions (e.g., `where`, `_meta`) and also schema-agnostic arguments via `params.args`.

## Modules

- `EthGraphQuery`
  - `async stringQuery<T>(data: string)`: Execute a raw GraphQL query string.
  - `async query<T = any>(data: GraphObject, metadata?: Metadata)`: Build and execute a single query.
  - `async multipleQuery<T = any>(data: Array<GraphObject>, metadata?: Metadata)`: Build and execute multiple queries in one request.

- `QueryBuilder` (static)
  - `buildJsonQuery(query: QueryJson)`: Build The Graph `where`/`block` filter string.
  - `buildArgs(args: Record<string, GraphQLArgValue>)`: Build generic GraphQL argument entries.
  - `buildElements(elements: Array<ElementType>)`: Build element selection strings.
  - `buildMetadata(metadata: Metadata)`: Build `_meta` selection (The Graph).
  - `buildInlineFragments(fragments: Array<InlineFragmentType>)`: Build inline fragments.
  - `buildQuery(data: GraphObject, metadata?: Metadata)`: Build a single query.
  - `buildMultipleQuery(data: Array<GraphObject>, metadata?: Metadata)`: Build multiple queries.
  - `makeFullQuery(query: string)`: Wrap a query fragment inside a GraphQL `query` operation.

## API

### GraphObject <a name="graphobject"></a>

```ts
{
  collection: string;
  params?: GraphParams;
}
```

### GraphParams <a name="graph_params"></a>

`GraphParams` describes the parameters for a collection query.

| id  | key             | type                            | description                                        |
| :-- | :-------------- | :------------------------------ | :------------------------------------------------- |
| 1   | elements        | Array<ElementType>              | Fields to fetch in the target collection          |
| 2   | inlineFragments | Array<InlineFragmentType>       | Inline fragments (`... on Type`)                  |
| 3   | args            | Record<string, GraphQLArgValue> | Generic GraphQL arguments (schema-agnostic)       |
| 4   | where           | QueryJson                       | The Graph-specific `where` filters                |
| 5   | id              | string                          | Shortcut for `id` filter                           |
| 6   | first           | number                          | Limit results (The Graph default max is 1000)      |
| 7   | orderBy         | string                          | Order by field                                     |
| 8   | orderDirection  | 'asc' or 'desc'                 | Order direction                                    |
| 9   | skip            | number                          | Skip results (The Graph default max is 5000)       |
| 10  | subgraphError   | 'allow' or 'deny'               | The Graph subgraph error behavior                 |
| 11  | block           | BlockQuery                      | The Graph block query (`hash` or `number`)         |

### ElementType <a name="element_type"></a>

An element can be a field name (`string`) or a nested collection.

```ts
type ElementType =
  | string
  | {
      collection: string;
      params?: GraphParams;
    };
```

### QueryJson <a name="query_json"></a>

`QueryJson` represents The Graph `where` filters.

```ts
const result = await query.query({
  collection: 'collection1',
  params: {
    elements: ['element1', 'element2'],
    where: { element1: '1234' },
  },
});
```

Complex operators use a `$` prefix (mapped to The Graph `_` operators):

```ts
const result = await query.query({
  collection: 'collection1',
  params: {
    elements: ['element1', 'element2'],
    where: { element1: '1234', id: { $in: ['0x1234', '0x4321'] } },
  },
});
```

Supported operator suffixes:

| id  | operator               |
| :-- | :--------------------- |
| 1   | contains               |
| 2   | contains_nocase        |
| 3   | ends_with              |
| 4   | ends_with_nocase       |
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

`BlockQuery` specifies a block hash or number (The Graph).

```ts
{ hash?: string; number?: number }
```

### Metadata <a name="metadata"></a>

`Metadata` describes The Graph `_meta` selection and block query.

```ts
{
  elements?: Array<'deployment' | 'hasIndexingErrors' | 'hash' | 'number' | 'timestamp'>;
  blockQuery?: { hash?: string; number?: number; number_gte?: number };
}
```

### InlineFragmentType <a name="inline_fragment_type"></a>

```ts
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
