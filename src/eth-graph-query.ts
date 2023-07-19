/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import { NormalQuery } from './normal-query.js';
import { QueryBuilder } from './query-builder.js';
import { GraphObject, Metadata } from './type.js';

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
  async query<T>(data: string): Promise<T>;

  /**
   * Create a query to a particular collection, returns the data respective with the query data.
   * @param {GraphObject} data An data for create query, contains two elements:
   *    1. collection: string - collection name
   *    2. params: GraphParams | undefined - If it is defined, it create a query to the collection
   * @param {Metadata | undefined} metadata If it is defined, the query can get metadata that you defined
   * @returns The data respective with the query data
   */
  async query<T = any>(data: GraphObject, metadata?: Metadata): Promise<T>;

  /**
   * Create a query to many collections, returns the data respective with the query data.
   * @param {Array<GraphObject>} data An array contain data to query to many collections
   * @param {Metadata | undefined} metadata If it is defined, the query can get metadata that you defined
   * @returns The data respective with the query data
   */
  async query<T = any>(data: Array<GraphObject>, metadata?: Metadata): Promise<T>;

  async query<T = any>(
    data: string | GraphObject | Array<GraphObject>,
    metadata?: Metadata,
  ): Promise<T> {
    if (typeof data == 'string') return await this.post<{ query: string }, T>('', { query: data });
    else if (Array.isArray(data)) {
      const sQuery = QueryBuilder.buildQuery(data, metadata);
      return await this.query<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
    } else {
      const sQuery = QueryBuilder.buildQuery(
        { collection: data.collection, params: data.params },
        metadata,
      );
      return await this.query<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
    }
  }
}
