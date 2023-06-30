/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import { NormalQuery } from './normal-query.js';
import { QueryBuilder } from './query-builder.js';
import { GraphParams, Metadata } from './type.js';

export class EthGraphQuery extends NormalQuery {
  queryName: string;

  /**
   * The constructor for create a query instance.
   * @param {string} rootUrl The url leading to the graph
   * @param {AxiosRequestConfig | undefined} config Config for base axios
   */
  constructor(rootUrl: string, config?: AxiosRequestConfig) {
    super(rootUrl, config);
    this.queryName = 'query';
  }

  /**
   * Given query string, returns the data respective with it.
   * @param {string} query A query string containing all data you want to fetch
   * @returns The data respective with the query string
   */
  async fetch<T>(query: string): Promise<T> {
    return await this.post<{ query: string }, T>('', { query: query });
  }

  /**
   * Create a query to a particular collection, returns the data respective with the query data.
   * @param {{ collection: string; params?: GraphParams }} data An data for create query, contains two elements:
   *    1. collection: string - collection name
   *    2. params: GraphParams | undefined - If it is defined, it create a query to the collection
   * @param {Metadata | undefined} metadata If it is defined, the query can get metadata that you defined
   * @returns The data respective with the query data
   */
  async query<T = any>(data: { collection: string; params?: GraphParams }, metadata?: Metadata): Promise<T> {
    const sQuery = QueryBuilder.buildQuery({ collection: data.collection, params: data.params }, metadata);
    return await this.fetch<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }

  /**
   * Create a query to many collections, returns the data respective with the query data.
   * @param {Array<{ collection: string; params?: GraphParams }>} data An array contain data to query to many collections
   * @param {Metadata | undefined} metadata If it is defined, the query can get metadata that you defined
   * @returns The data respective with the query data
   */
  async mergeQuery<T = any>(
    data: Array<{ collection: string; params?: GraphParams }>,
    metadata?: Metadata,
  ): Promise<T> {
    const sQuery = QueryBuilder.mergeQuery(data, metadata);
    return await this.fetch<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }
}
