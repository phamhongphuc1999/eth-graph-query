import { AxiosRequestConfig } from 'axios';
import NormalQuery from './normal-query';
import { GraphParams } from './type';
import QueryBuilder from './query-builder';

export default class EthGraphQuery extends NormalQuery {
  constructor(rootUrl: string, config?: AxiosRequestConfig) {
    super(rootUrl, config);
  }

  async query(collection: string, params: GraphParams) {
    const sQuery = QueryBuilder.buildQuery(collection, params);
    return await this.post('', { query: QueryBuilder.makeFullQuery(sQuery) });
  }
}
