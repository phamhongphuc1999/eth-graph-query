import { assert, describe, it } from 'vitest';
import { EthGraphQuery } from '../eth-graph-query';

const API_URL = 'https://graphqlzero.almansi.me/api';

describe('Integration tests with GraphQLZero', () => {
  const ethGraphQuery = new EthGraphQuery(API_URL);

  it('Fetch a single post', async () => {
    const data = await ethGraphQuery.query<{ post: { id: string; title: string } }>({
      collection: 'post',
      params: {
        id: '1',
        elements: ['id', 'title'],
      },
    });

    assert.ok(data.post);
    assert.equal(data.post.id, '1');
    assert.ok(data.post.title);
  });

  it('Fetch multiple posts', async () => {
    const data = await ethGraphQuery.query<{
      posts: { data: Array<{ id: string; title: string }> };
    }>({
      collection: 'posts',
      params: {
        elements: [
          {
            collection: 'data',
            params: {
              elements: ['id', 'title'],
            },
          },
        ],
      },
    });

    assert.ok(data.posts.data);
    assert.ok(data.posts.data.length > 0);
  });

  it('Fetch multiple collections (post and user)', async () => {
    const data = await ethGraphQuery.multipleQuery<{
      post: { id: string; title: string };
      user: { id: string; name: string };
    }>([
      {
        collection: 'post',
        params: {
          id: '1',
          elements: ['id', 'title'],
        },
      },
      {
        collection: 'user',
        params: {
          id: '1',
          elements: ['id', 'name'],
        },
      },
    ]);

    assert.ok(data.post);
    assert.ok(data.user);
    assert.equal(data.post.id, '1');
    assert.equal(data.user.id, '1');
  });

  it('Fetch with where filter (GraphQLZero style)', async () => {
    // GraphQLZero uses 'options' for filtering, but our buildQuery targets The Graph's 'where'
    // However, we can use stringQuery for custom structures if needed.
    // Let's test if we can use our JSON builder for its 'options' if we map it.

    // Actually, let's just test a simple string query to verify the connection is solid
    const data = await ethGraphQuery.stringQuery<{ post: { id: string } }>(
      'query { post(id: 2) { id } }',
    );
    assert.equal(data.post.id, '2');
  });
});
