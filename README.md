<h1>
eth-graph-query
</h1>

Simple package for create query command to [the GraphQL](https://thegraph.com/).

---

### Installation

```shell
npm install eth-graph-query

```

---

### Usage

- The first thing you have to do is creating a query instance

```js
const query = new EthGraphQuery(root);
```

- This package has two query options. To create simple query

```js
const result = await query.query('collection1', { elements: ['element1', 'element2'] });
```

- To create a multiple query

```js
const result = await query.mergeQuery([
  { collection: 'collection1', params: { elements: ['element11', 'element12'] } },
  { collection: 'collection2', params: { elements: ['element21', 'element22'] } },
]);
```

- You can create a complex query

```js
const result = await query.mergeQuery([
  { collection: 'collection1', params: { elements: ['element11', 'element12'], where: { element11: 'abc' } } },
  {
    collection: 'collection2',
    params: {
      elements: [
        'element21',
        {
          collection: 'collection3',
          params: { elements: ['element31'], where: { id: { in: ['123'] }, element11: 'element31' }, first: 50 },
        },
      ],
    },
  },
]);
```

---

### For develop

- To test package, you can run below command

```shell
npm run test
```

- Before running above command, you must create `.env` file

```shell
cp .env.example .env
```
