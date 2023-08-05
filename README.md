<h1>
eth-graph-query
</h1>

Simple package for creating query to [the GraphQL](https://thegraph.com/).

---

### Installation

```shell
npm install eth-graph-query

```

- Or if you use `yarn`

```shell
yarn add eth-graph-query
```

---

### Usage

- The first thing you have to do is creating a query instance

```js
const query = new EthGraphQuery(root);
```

- This package has three query options. Simply, you can create a direct string query

```js
result = await query.query(`query query {
  collection1(first: 10) {
    element1
    element2
  }
}`);
```

- More readable, you can create a single json query

```js
const result = await query.query({
  collection: 'collection1',
  params: {
    elements: ['element1', 'element2'],
    first: 10,
  },
});
```

- You can create a multiple json queries

```js
const result = await query.query([
  {
    collection: 'collection1',
    params: {
      elements: ['element11', 'element12'],
    },
  },
  {
    collection: 'collection2',
    params: {
      elements: ['element21', 'element22'],
    },
  },
]);
```

- You can create a complex query

```js
const result = await query.query([
  {
    collection: 'collection1',
    params: {
      elements: ['element11', 'element12'],
      where: { element11: 'abc' },
    },
  },
  {
    collection: 'collection2',
    params: {
      elements: [
        'element21',
        {
          collection: 'collection3',
          params: {
            elements: ['element31'],
            where: {
              id: { $in: ['123'] },
              token_: { setId: { $in: ['1', 2, true] } },
              element31: 'element31',
            },
            first: 50,
          },
        },
      ],
      where: {
        element21: '123',
        collection3: { element31: '123' },
      },
      inlineFragments: [
        {
          collection: 'BridgeDepositTransaction',
          params: { elements: ['id', 'l1Token'] },
        },
        {
          collection: 'NameSignalTransaction',
          params: { elements: ['id', 'timestamp'] },
        },
      ],
    },
  },
]);
```

---

### API

Read the [API Docs](https://github.com/phamhongphuc1999/eth-graph-query/blob/main/documents/api.md), you also read my [examples](https://github.com/phamhongphuc1999/eth-graph-query/blob/main/examples)

---

### For developer

- Run example

```shell
npm run example example/file-name
```

- Run test

```shell
npm run test
```

### Reference

- https://spec.graphql.org
