import { AxiosRequestConfig } from 'axios';
import NormalQuery from './normal-query';
import { GraphParams } from './type';
import QueryBuilder from './query-builder';

export default class EthGraphQuery extends NormalQuery {
  constructor(rootUrl: string, config?: AxiosRequestConfig) {
    super(rootUrl, config);
  }

  private async _fetch(query: string) {
    return await this.post('', { query: query });
  }

  async query(collection: string, params?: GraphParams) {
    const sQuery = QueryBuilder.buildQuery(collection, params);
    return await this._fetch(QueryBuilder.makeFullQuery(sQuery));
  }

  async mergeQuery(data: Array<{ collection: string; params?: GraphParams }>) {
    const sQuery = QueryBuilder.mergeQuery(data);
    return await this._fetch(QueryBuilder.makeFullQuery(sQuery));
  }
}
