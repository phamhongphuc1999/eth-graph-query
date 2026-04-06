/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  OptionKeys,
  type ElementType,
  type GraphObject,
  type GraphParams,
  type InlineFragmentType,
  type Metadata,
  type QueryJson,
} from './type';

const MAX_FIRST = 1000;
const MAX_SKIP = 5000;

export class QueryBuilder {
  private static escapeGraphqlString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  private static serializeValue(value: string | number | boolean | null): string {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${this.escapeGraphqlString(value)}"`;
    return `${value}`;
  }

  /**
   * Converts a JSON query object into a GraphQL-compatible string.
   * Handles nested objects and operator mapping (e.g., $gt -> _gt).
   * @param query - The JSON filter object to build.
   * @returns A string representing the GraphQL 'where' or 'block' filter.
   */
  static buildJsonQuery(query: QueryJson): string {
    const whereList = [];
    for (const key in query) {
      const value = query[key];
      if (value === undefined) continue;

      if (value === null) {
        whereList.push(`${key}: null`);
      } else if (Array.isArray(value)) {
        const queryArray = value as Array<string | number | boolean>;
        whereList.push(
          `${key}: [${queryArray
            .map((item) => (typeof item === 'string' ? this.serializeValue(item) : item))
            .join(', ')}]`,
        );
      } else if (typeof value === 'string') whereList.push(`${key}: ${this.serializeValue(value)}`);
      else if (typeof value === 'object') {
        const normalJson: QueryJson = {};
        const operatorJson: QueryJson = {};
        const options = value as { [key: string]: any };

        for (const option in options) {
          const optionValue = options[option];
          if (option.startsWith('$')) {
            const realOperator = option.slice(1);
            if ((OptionKeys as readonly string[]).includes(realOperator)) {
              operatorJson[`${key}_${realOperator}`] = optionValue;
            } else {
              normalJson[option] = optionValue;
            }
          } else normalJson[option] = optionValue;
        }

        if (Object.keys(normalJson).length > 0)
          whereList.push(`${key}: {${this.buildJsonQuery(normalJson)}}`);

        if (Object.keys(operatorJson).length > 0) whereList.push(this.buildJsonQuery(operatorJson));
      } else whereList.push(`${key}: ${value}`);
    }
    return whereList.join(', ');
  }

  /**
   * Builds the fields/elements part of a GraphQL query from an array of strings or objects.
   * @param elements - An array of fields to query. Can include nested collections as GraphObject.
   * @returns An array of strings representing the selected fields.
   */
  static buildElements(elements: Array<ElementType>): Array<string> {
    return elements.map((element) => {
      if (typeof element === 'string') return element;
      const object = element as { collection: string; params: GraphParams };
      return this.buildQuery({ collection: object.collection, params: object.params });
    });
  }

  /**
   * Builds the metadata (_meta) fragment of a GraphQL query.
   * @param metadata - The metadata configuration.
   * @returns A string representing the _meta query fragment.
   */
  static buildMetadata(metadata: Metadata): string {
    let result = '';
    const blockQuery = [];
    if (metadata.blockQuery) {
      if (metadata.blockQuery.hash) blockQuery.push(`hash: "${metadata.blockQuery.hash}"`);
      if (metadata.blockQuery.number !== undefined)
        blockQuery.push(`number: ${metadata.blockQuery.number}`);
      if (metadata.blockQuery.number_gte !== undefined)
        blockQuery.push(`number_gte: ${metadata.blockQuery.number_gte}`);
    }
    const sBlockQuery = blockQuery.join(', ');
    if (sBlockQuery.length > 0) result += `(block: {${sBlockQuery}})`;

    const filters: Array<string> = [];
    const blockFilters: Array<string> = [];
    if (metadata.elements) {
      for (const filter of metadata.elements) {
        if (filter === 'deployment' || filter === 'hasIndexingErrors') {
          if (!filters.includes(filter)) filters.push(filter);
        } else {
          if (!blockFilters.includes(filter)) blockFilters.push(filter);
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
   * Builds an inline fragment (... on Collection { ... }) for a query.
   * @param fragment - The inline fragment configuration.
   * @returns A string representing the inline fragment.
   * @private
   */
  private static _buildInlineFragment(fragment: InlineFragmentType): string {
    const elements = fragment.params?.elements?.length
      ? this.buildElements(fragment.params.elements)
      : ['id'];
    return `... on ${fragment.collection}{${elements.join(' ')}}`;
  }

  /**
   * Builds multiple inline fragments from an array of fragment configurations.
   * @param fragments - An array of inline fragments.
   * @returns A string containing all built inline fragments.
   */
  static buildInlineFragments(fragments: Array<InlineFragmentType>): string {
    return fragments.map((fragment) => this._buildInlineFragment(fragment)).join(' ');
  }

  /**
   * Builds a complete GraphQL query for a single collection.
   * @param data - The collection and parameters for the query.
   * @param metadata - Optional metadata configuration.
   * @returns A string containing the GraphQL query for the collection.
   */
  static buildQuery(data: GraphObject, metadata?: Metadata): string {
    const { collection, params } = data;
    const filters: Array<string> = [];

    if (params?.id !== undefined) filters.push(`id: ${this.serializeValue(params.id)}`);
    if (params?.orderBy) filters.push(`orderBy: ${params.orderBy}`);
    if (params?.orderDirection) filters.push(`orderDirection: ${params.orderDirection}`);
    if (params?.subgraphError) filters.push(`subgraphError: ${params.subgraphError}`);

    if (params?.first !== undefined) {
      const first = Math.max(0, Math.min(params.first, MAX_FIRST));
      filters.push(`first: ${first}`);
    }

    if (params?.skip !== undefined) {
      const skip = Math.max(0, Math.min(params.skip, MAX_SKIP));
      filters.push(`skip: ${skip}`);
    }

    if (params?.where) {
      const sWhere = this.buildJsonQuery(params.where);
      if (sWhere.length > 0) filters.push(`where: {${sWhere}}`);
    }

    if (params?.block) {
      const sBlock = this.buildJsonQuery(params.block);
      if (sBlock.length > 0) filters.push(`block: {${sBlock}}`);
    }

    const filterString = filters.length > 0 ? `(${filters.join(', ')})` : '';

    let elements = ['id'];
    if (params?.elements && params.elements.length > 0) {
      elements = this.buildElements(params.elements);
    }

    let inlineFragments = '';
    if (params?.inlineFragments && params.inlineFragments.length > 0) {
      inlineFragments = ` ${this.buildInlineFragments(params.inlineFragments)}`;
    }

    const finalQuery = `${collection}${filterString} {${elements.join(' ')}${inlineFragments}}`;

    if (metadata) {
      const sMetadata = this.buildMetadata(metadata);
      return sMetadata ? `${sMetadata} ${finalQuery}` : finalQuery;
    }
    return finalQuery;
  }

  /**
   * Builds a query that targets multiple collections simultaneously.
   * @param data - An array of collection queries and their parameters.
   * @param metadata - Optional metadata configuration that applies to the entire query.
   * @returns A string containing the merged GraphQL query for multiple collections.
   */
  static buildMultipleQuery(data: Array<GraphObject>, metadata?: Metadata): string {
    const queries = data.map((item) =>
      this.buildQuery({ collection: item.collection, params: item.params }),
    );
    const finalQuery = queries.join(' ');

    if (metadata) {
      const sMetadata = this.buildMetadata(metadata);
      return sMetadata ? `${sMetadata} ${finalQuery}` : finalQuery;
    }
    return finalQuery;
  }

  /**
   * Wraps a query fragment into a full GraphQL 'query' block.
   * @param query - The query fragment to wrap.
   * @param queryName - An optional name for the GraphQL query (defaults to 'query').
   * @returns The full GraphQL query string.
   */
  static makeFullQuery(query: string, queryName = 'query'): string {
    return `query ${queryName} {${query}}`;
  }
}
