/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import { ApiQuery } from './api-query';
import { QueryBuilder } from './query-builder';
import { ErrorObject, GraphObject, Metadata } from './type';

export class EthGraphQuery extends ApiQuery {
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
  async stringQuery<T = any>(data: string): Promise<T> {
    const result = await this.post<{ query: string }, T | ErrorObject>('', { query: data });
    if ((result as ErrorObject).errors) {
      const _error = result as ErrorObject;
      throw new Error(_error.errors[0].message);
    }
    return result as T;
  }

  /**
   * Create a query to a particular collection, returns the data respective with the query data.
   * @param {GraphObject} data An data for create query, contains two elements:
   *    1. collection: string - collection name
   *    2. params: GraphParams | undefined - If it is defined, it create a query to the collection
   * @param {Metadata | undefined} metadata If it is defined, the query can get metadata that you defined
   * @returns The data respective with the query data
   */
  async query<T = any>(data: GraphObject, metadata?: Metadata): Promise<T> {
    const _data = data as GraphObject;
    const sQuery = QueryBuilder.buildQuery(
      { collection: _data.collection, params: _data.params },
      metadata,
    );
    return await this.stringQuery<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }

  /**
   * Create a query to many collections, returns the data respective with the query data.
   * @param {Array<GraphObject>} data An array contain data to query to many collections
   * @param {Metadata | undefined} metadata If it is defined, the query can get metadata that you defined
   * @returns The data respective with the query data
   */
  async multipleQuery<T = any>(data: Array<GraphObject>, metadata?: Metadata): Promise<T> {
    const sQuery = QueryBuilder.buildMultipleQuery(data, metadata);
    return await this.stringQuery<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }
}
