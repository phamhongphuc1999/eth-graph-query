/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import NormalQuery from './normal-query';
import QueryBuilder from './query-builder';
import { GraphParams } from './type';

export default class EthGraphQuery extends NormalQuery {
  constructor(rootUrl: string, config?: AxiosRequestConfig) {
    super(rootUrl, config);
  }

  protected async _fetch<T>(query: string) {
    return await this.post<{ query: string }, T>('', { query: query });
  }

  async query<T = any>(collection: string, params?: GraphParams): Promise<T> {
    const sQuery = QueryBuilder.buildQuery(collection, params);
    return await this._fetch<T>(QueryBuilder.makeFullQuery(sQuery));
  }

  async mergeQuery<T = any>(data: Array<{ collection: string; params?: GraphParams }>): Promise<T> {
    const sQuery = QueryBuilder.mergeQuery(data);
    return await this._fetch<T>(QueryBuilder.makeFullQuery(sQuery));
  }
}
