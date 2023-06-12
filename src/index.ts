/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import NormalQuery from './normal-query';
import QueryBuilder from './query-builder';
import { GraphParams, Metadata } from './type';

export default class EthGraphQuery extends NormalQuery {
  queryName: string;

  constructor(rootUrl: string, config?: AxiosRequestConfig) {
    super(rootUrl, config);
    this.queryName = 'query';
  }

  protected async _fetch<T>(query: string) {
    return await this.post<{ query: string }, T>('', { query: query });
  }

  async query<T = any>(data: { collection: string; params?: GraphParams }, metadata?: Metadata): Promise<T> {
    const sQuery = QueryBuilder.buildQuery({ collection: data.collection, params: data.params }, metadata);
    return await this._fetch<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }

  async mergeQuery<T = any>(
    data: Array<{ collection: string; params?: GraphParams }>,
    metadata?: Metadata,
  ): Promise<T> {
    const sQuery = QueryBuilder.mergeQuery(data, metadata);
    return await this._fetch<T>(QueryBuilder.makeFullQuery(sQuery, this.queryName));
  }
}
