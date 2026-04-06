# eth-graph-query

A lightweight GraphQL query builder and client with first-class support for The Graph. Build queries using JSON, avoid string concatenation, and keep strong TypeScript types.

[![npm version](https://img.shields.io/npm/v/eth-graph-query.svg)](https://www.npmjs.com/package/eth-graph-query)
[![license](https://img.shields.io/npm/l/eth-graph-query.svg)](https://github.com/phamhongphuc1999/eth-graph-query/blob/main/LICENSE)

---

## Features

- JSON to GraphQL: Convert nested JSON structures into valid GraphQL query strings.
- Multiple collections: Query multiple collections in a single HTTP request.
- Deep nesting: Support nested collection queries and entity relationships.
- Advanced filtering: The Graph operators via `$` prefix (e.g., `$gt`, `$in`, `$contains`).
- Inline fragments: Support GraphQL inline fragments (`... on Type`).
- Generic GraphQL args: Pass schema-agnostic arguments via `params.args`.
- TypeScript first: Full type definitions for parameters, filters, and metadata.
- Metadata support: Fetch subgraph metadata (`_meta`) when using The Graph.

---

## Installation

```shell
# npm
npm install eth-graph-query

# yarn
yarn add eth-graph-query

# bun
bun add eth-graph-query
```

---

## Quick Start

```typescript
import { EthGraphQuery } from 'eth-graph-query';

const rootUrl = 'https://api.thegraph.com/subgraphs/name/username/subgraph-name';
const client = new EthGraphQuery(rootUrl, {
  headers: { Authorization: 'Bearer <token>' },
  timeoutMs: 10_000,
});
```

---

## Usage

### 1. Single Collection Query (The Graph)

```typescript
const result = await client.query({
  collection: 'users',
  params: {
    elements: ['id', 'name', 'balance'],
    where: { balance: { $gt: '1000' } },
    first: 10,
    orderBy: 'balance',
    orderDirection: 'desc',
  },
});
```

### 2. Multiple Collections Query

```typescript
const result = await client.multipleQuery([
  {
    collection: 'tokens',
    params: { elements: ['id', 'symbol'], first: 5 },
  },
  {
    collection: 'factories',
    params: { elements: ['id', 'poolCount'] },
  },
]);
```

### 3. Advanced Nested Query & Filters (The Graph)

```typescript
const result = await client.query({
  collection: 'pools',
  params: {
    elements: [
      'id',
      'token0',
      {
        collection: 'swaps',
        params: {
          elements: ['amount0', 'amount1', 'timestamp'],
          where: {
            amount0: { $gt: 0 },
            timestamp: { $gte: 1672531200 },
          },
          first: 50,
        },
      },
    ],
    where: {
      id: { $in: ['0x123...', '0x456...'] },
    },
  },
});
```

### 4. Generic GraphQL Arguments (Schema-Agnostic)

Use `params.args` to pass arbitrary GraphQL arguments for non-The-Graph schemas.

```typescript
const result = await client.query({
  collection: 'users',
  params: {
    args: {
      first: 20,
      orderBy: 'name',
      filter: { active: true },
    },
    elements: ['id', 'name'],
  },
});
```

---

## API Reference

Documentation for all functions and types can be found in the API docs:

- [API Docs](https://github.com/phamhongphuc1999/eth-graph-query/blob/main/documents/api.md)

---

## Notes

- This library uses the native `fetch` API (Node 20+). No Axios dependency.
- The Graph-specific features (`where`, `_meta`, `block`) remain supported.

---

## For Developers

### Run Tests

```shell
npm run test
```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

---

## References

- [The Graph Documentation](https://thegraph.com/docs/)
- [GraphQL Specification](https://spec.graphql.org)
