import { GraphParams, QueryJson } from './type';

export default class QueryBuilder {
  static buildJsonQuery(query: QueryJson): string {
    const whereList = [];
    for (const key in query) {
      if (query[key] != undefined) {
        if (Array.isArray(query[key])) {
          const queryArray = query[key] as Array<string>;
          whereList.push(`${key}: [${queryArray.map((item) => `"${item}"`).join(', ')}]`);
        } else if (typeof query[key] == 'object')
          whereList.push(`${key}: {${this.buildJsonQuery(query[key] as QueryJson)}}`);
        else if (typeof query[key] == 'string') whereList.push(`${key}: "${query[key]}"`);
        else whereList.push(`${key}: ${query[key]}`);
      }
    }
    return whereList.join(', ');
  }

  static buildQuery(collection: string, params?: GraphParams) {
    const filters: Array<string> = [];
    if (params?.id != undefined) filters.push(`id: ${params.id}`);
    if (params?.orderBy) filters.push(`orderBy: ${params.orderBy}`);
    if (params?.orderDirection) filters.push(`orderDirection: ${params.orderDirection}`);
    if (params?.first != undefined) {
      if (params.first < 0) params.first = 0;
      else if (params.first > 1000) params.first = 1000;
      filters.push(`first: ${params.first}`);
    }
    if (params?.skip != undefined) {
      if (params.skip < 0) params.skip = 0;
      else if (params.skip > 5000) params.skip = 5000;
      filters.push(`skip: ${params.skip}`);
    }
    if (params?.where) {
      const sWhere = this.buildJsonQuery(params.where);
      if (sWhere.length > 0) filters.push(`where: {${sWhere}}`);
    }
    if (params?.block) {
      const sBlock = this.buildJsonQuery(params.block);
      if (sBlock.length > 0) filters.push(`block: {${sBlock}}`);
    }
    const filterString = filters.join(', ');
    let elements = ['id'];
    if (params?.elements) if (params.elements.length > 0) elements = params.elements;
    if (filterString.length > 0) return `${collection}(${filterString}) {${elements.join(' ')}}`;
    else return `${collection} {${elements.join(' ')}}`;
  }

  static mergeQuery(data: Array<{ collection: string; params?: GraphParams }>) {
    const queries: Array<string> = [];
    for (const item of data) queries.push(this.buildQuery(item.collection, item.params));
    return queries.join(' ');
  }

  static makeFullQuery(query: string) {
    return `query MyQuery {${query}}`;
  }
}
