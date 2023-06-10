import { GraphParams, QueryJson } from './type';

export default class QueryBuilder {
  static buildJsonQuery(query: QueryJson): string {
    const whereList = [];
    for (const key in query) {
      if (query[key] != undefined) {
        if (typeof query[key] == 'object') {
          whereList.push(`${key}: {${this.buildJsonQuery(query[key] as QueryJson)}}`);
        } else {
          whereList.push(`${key}: ${query[key]}`);
        }
      }
    }
    return whereList.join(', ');
  }

  static buildQuery(collection: string, params: GraphParams) {
    const filters: Array<string> = [];
    if (params.id != undefined) filters.push(`id: ${params.id}`);
    if (params.orderBy) filters.push(`orderBy: ${params.orderBy}`);
    if (params.orderDirection) filters.push(`orderDirection: ${params.orderDirection}`);
    if (params.first != undefined) {
      if (params.first < 0) params.first = 0;
      else if (params.first > 1000) params.first = 1000;
      filters.push(`first: ${params.first}`);
    }
    if (params.skip != undefined) {
      if (params.skip < 0) params.skip = 0;
      else if (params.skip > 5000) params.skip = 5000;
      filters.push(`skip: ${params.skip}`);
    }
    if (params.where) {
      const sWhere = this.buildJsonQuery(params.where);
      if (sWhere.length > 0) filters.push(`where: {${sWhere}}`);
    }
    if (params.block) {
      const sBlock = this.buildJsonQuery(params.block);
      if (sBlock.length > 0) filters.push(`block: {${sBlock}}`);
    }
    const filterString = filters.join(', ');
    if (filterString.length > 0) return `${collection}(${filterString}) {${params.elements.join(' ')}}`;
    else return `${collection} {${params.elements.join(' ')}}`;
  }

  static makeFullQuery(query: string) {
    return `query MyQuery {${query}}`;
  }
}
