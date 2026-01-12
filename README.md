# eth-graph-query

A lightweight and flexible library for building [The Graph (GraphQL)](https://thegraph.com/) queries using simple JSON objects. Eliminate the need for complex string concatenation and maintain type-safe queries.

[![npm version](https://img.shields.io/npm/v/eth-graph-query.svg)](https://www.npmjs.com/package/eth-graph-query)
[![license](https://img.shields.io/npm/l/eth-graph-query.svg)](https://github.com/phamhongphuc1999/eth-graph-query/blob/main/LICENSE)

---

## 🚀 Features

- **JSON to GraphQL**: Convert nested JSON structures into valid GraphQL query strings.
- **Multiple Collections**: Query multiple collections in a single HTTP request.
- **Deep Nesting**: Support for nested collection queries and entity relationships.
- **Advanced Filtering**: Full support for The Graph's operators (`_gt`, `_in`, `_contains`, etc.) via `$` prefix.
- **Inline Fragments**: Support for GraphQL inline fragments (`... on Type`).
- **TypeScript First**: Full type definitions for parameters, filters, and metadata.
- **Metadata Support**: Easily fetch subgraph metadata (`_meta`).

---

## 📦 Installation

```shell
# npm
npm install eth-graph-query

# yarn
yarn add eth-graph-query

# bun
bun install eth-graph-query
```

---

## 💡 Usage

### 1. Initialize the Client

```typescript
import { EthGraphQuery } from 'eth-graph-query';

const rootUrl = 'https://api.thegraph.com/subgraphs/name/username/subgraph-name';
const client = new EthGraphQuery(rootUrl);
```

### 2. Single Collection Query

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

### 3. Multiple Collections Query

Fetch data from multiple collections in a single round-trip.

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

### 4. Advanced Nested Query & Filters

Build complex queries with nested collections and operators.

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

---

## 📘 API Reference

Documentation for all functions and types can be found in the [API Docs](https://github.com/phamhongphuc1999/eth-graph-query/blob/main/documents/api.md).

---

## 🛠 For Developers

### Run Tests

```shell
npm run test
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 References

- [The Graph Documentation](https://thegraph.com/docs/)
- [GraphQL Specification](https://spec.graphql.org)
