import { ElementType, GraphParams, Metadata, OptionKeys, OptionsKey, QueryJson, WhereOptions } from './type.js';

export class QueryBuilder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static isWhereOptions(data: any) {
    const keys = Object.keys(data);
    if (keys.length == 0) return false;
    for (const key of keys) {
      if (!OptionKeys.includes(key)) return false;
    }
    return true;
  }

  /**
   * Create a query string from a query with json format.
   * @param {QueryJson} query the json format query
   * @returns a query string respective with the json format query
   */
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
        } else if (typeof query[key] == 'object') {
          whereList.push(`${key}: {${this.buildJsonQuery(query[key] as QueryJson)}}`);
        } else if (typeof query[key] == 'string') {
          whereList.push(`${key}: "${query[key]}"`);
        } else whereList.push(`${key}: ${query[key]}`);
      }
    }
    return whereList.join(', ');
  }

  /**
   * Given a json format array as element input, returns the string array represent elements you want to query in the graph.
   * @param {Array<ElementType>} elements A array with {@link ElementType} elements, each element in the array represent a element in the graph you want to query
   * @returns {Array<string>} The string array represent the input array
   */
  static buildElements(elements: Array<ElementType>): Array<string> {
    const elementList = [];
    for (const element of elements) {
      if (typeof element == 'string') elementList.push(element);
      else {
        const object = element as { collection: string; params: GraphParams };
        elementList.push(this.buildQuery({ collection: object.collection, params: object.params }));
      }
    }
    return elementList;
  }

  /**
   * Given a instance of {@link Metadata}, returns the string represent the metadata you want to query
   * @param {Metadata} metadata The instance represent all metadata you want to query
   * @returns The string represent the metadata you want to query
   */
  static buildMetadata(metadata: Metadata): string {
    let result = '';
    const blockQuery = [];
    if (metadata.blockQuery) {
      if (metadata.blockQuery.hash) blockQuery.push(`hash: "${metadata.blockQuery.hash}"`);
      if (metadata.blockQuery.number) blockQuery.push(`number: ${metadata.blockQuery.number}`);
      if (metadata.blockQuery.number_gte) blockQuery.push(`number_gte: ${metadata.blockQuery.number_gte}`);
    }
    const sBlockQuery = blockQuery.join(', ');
    if (sBlockQuery.length > 0) result += `(block: {${sBlockQuery}})`;
    const filters: Array<string> = [];
    const blockFilters: Array<string> = [];
    if (metadata.elements) {
      for (const filter of metadata.elements) {
        if (filter == 'deployment' || filter == 'hasIndexingErrors') {
          const sFilter = filter.toString();
          if (!filters.includes(sFilter)) filters.push(sFilter);
        } else {
          const sFilter = filter.toString();
          if (!blockFilters.includes(sFilter)) blockFilters.push(sFilter);
        }
      }
      const blockFilterQuery = blockFilters.join(' ');
      if (blockFilterQuery.length > 0) filters.push(`block{${blockFilterQuery}}`);
      const sFiltersQuery = filters.join(' ');
      if (sFiltersQuery.length > 0) result += `{${sFiltersQuery}}`;
    }
    return result.length > 0 ? `_meta${result}` : '';
  }

  /**
   * Given json data, returns the string query. This function only can create a string query for a particular collection.
   * @param {{ collection: string; params?: GraphParams }} data An data for create query, contains two elements:
   *   1. collection: string - collection name
   *   2. params: GraphParams | undefined - If it is defined, it create a query to the collection
   * @param {Metadata | undefined} metadata If it is defined, the query can get metadata that you defined
   * @returns The string query
   */
  static buildQuery(data: { collection: string; params?: GraphParams }, metadata?: Metadata): string {
    const collection = data.collection;
    const params = data.params;
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
    let finalQuery = '';
    if (filterString.length > 0) finalQuery = `${collection}(${filterString}) {${elements.join(' ')}}`;
    else finalQuery = `${collection} {${elements.join(' ')}}`;
    if (metadata) {
      const sMetadata = this.buildMetadata(metadata);
      if (sMetadata.length > 0) return `${sMetadata} ${finalQuery}`;
      else return finalQuery;
    }
    return finalQuery;
  }

  /**
   * Given a array contain many json data, return a query string represent a query to all collections that is in a array.
   * @param {Array<{ collection: string; params?: GraphParams }>} data An array contain data to query to many collections
   * @param {Metadata | undefined} metadata If it is defined, the query can get metadata that you defined
   * @returns The query string
   */
  static mergeQuery(data: Array<{ collection: string; params?: GraphParams }>, metadata?: Metadata): string {
    const queries: Array<string> = [];
    for (const item of data) queries.push(this.buildQuery({ collection: item.collection, params: item.params }));
    const finalQuery = queries.join(' ');
    if (metadata) {
      const sMetadata = this.buildMetadata(metadata);
      if (sMetadata.length > 0) return `${sMetadata} ${finalQuery}`;
      else return finalQuery;
    }
    return finalQuery;
  }

  /**
   * Create complete query string, you can use directly this query to query to the graph
   * @param {string} query The query string
   * @param {string} queryName The query name(default query)
   * @returns The complete query string
   */
  static makeFullQuery(query: string, queryName = 'query'): string {
    return `query ${queryName} {${query}}`;
  }
}
