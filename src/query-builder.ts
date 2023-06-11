import { ElementType, GraphParams, OptionKeys, OptionsKey, QueryJson, WhereOptions } from './type';

export default class QueryBuilder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isWhereOptions(data: any) {
    const keys = Object.keys(data);
    if (keys.length == 0) return true;
    for (const key of keys) {
      if (!OptionKeys.includes(key)) return false;
    }
    return true;
  }

  static buildJsonQuery(query: QueryJson): string {
    const whereList = [];
    for (const key in query) {
      if (query[key] != undefined) {
        if (Array.isArray(query[key])) {
          const queryArray = query[key] as Array<string>;
          whereList.push(`${key}: [${queryArray.map((item) => `"${item}"`).join(', ')}]`);
        } else if (this.isWhereOptions(query[key])) {
          const realJson: QueryJson = {};
          const options = query[key] as WhereOptions;
          for (const option in options) {
            const value = options[option as OptionsKey];
            if (value) realJson[`${key}_${option}`] = value;
          }
          whereList.push(`${this.buildJsonQuery(realJson as QueryJson)}`);
        } else if (typeof query[key] == 'object')
          whereList.push(`${key}: {${this.buildJsonQuery(query[key] as QueryJson)}}`);
        else if (typeof query[key] == 'string') whereList.push(`${key}: "${query[key]}"`);
        else whereList.push(`${key}: ${query[key]}`);
      }
    }
    return whereList.join(', ');
  }

  static buildElements(elements: Array<ElementType>): Array<string> {
    const elementList = [];
    for (const element of elements) {
      if (typeof element == 'string') elementList.push(element);
      else {
        const object = element as { collection: string; params: GraphParams };
        elementList.push(this.buildQuery(object.collection, object.params));
      }
    }
    return elementList;
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
    let elements: Array<string> = ['id'];
    if (params?.elements) if (params.elements.length > 0) elements = this.buildElements(params.elements);
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
