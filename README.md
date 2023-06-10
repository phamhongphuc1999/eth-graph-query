<h1>
eth-graph-query
</h1>

Simple package for create query command to the GraphQL in ethereum

---

### Installation

```shell
npm install eth-graph-query

```

---

### Usage

- The first thing you have to do is create a query instance

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
  {collection: 'collection1', {element: ['element11', 'element12']}},
  {collection: 'collection2', {element: ['element21', 'element22']}}
])
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
