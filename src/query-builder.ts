/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ElementType,
  type GraphObject,
  type GraphParams,
  type GraphQLArgValue,
  type InlineFragmentType,
  type Metadata,
  type QueryJson,
} from './type';

const MAX_FIRST = 1000;
const MAX_SKIP = 5000;
const OPTION_KEYS_SET = new Set<string>([
  'contains',
  'contains_nocase',
  'ends_with',
  'ends_with_nocase',
  'end_with_nocase',
  'starts_with',
  'starts_with_nocase',
  'not_contains',
  'not_contains_nocase',
  'not_ends_with',
  'not_ends_with_nocase',
  'not_starts_with',
  'not_starts_with_nocase',
  'gt',
  'gte',
  'lt',
  'lte',
  'not',
  'in',
  'not_in',
]);

export class QueryBuilder {
  private static escapeGraphqlString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  static serializeValue(value: string | number | boolean | null): string {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${this.escapeGraphqlString(value)}"`;
    return `${value}`;
  }

  private static serializeArgValue(value: GraphQLArgValue): string {
    if (value === null) return 'null';
    if (value === undefined) return 'null';
    if (typeof value === 'string') return this.serializeValue(value);
    if (typeof value === 'number' || typeof value === 'boolean') return `${value}`;
    if (Array.isArray(value)) {
      return `[${value.map((item) => this.serializeArgValue(item)).join(', ')}]`;
    }
    const entries = this.buildArgs(value);
    return `{${entries.join(', ')}}`;
  }

  private static buildArgs(args: { [key: string]: GraphQLArgValue }): Array<string> {
    const entries: Array<string> = [];
    for (const key in args) {
      if (!Object.prototype.hasOwnProperty.call(args, key)) continue;
      const value = args[key];
      if (value === undefined) continue;
      entries.push(`${key}: ${this.serializeArgValue(value)}`);
    }
    return entries;
  }

  static buildJsonQuery(query: QueryJson): string {
    const whereList = [];
    for (const key in query) {
      if (!Object.prototype.hasOwnProperty.call(query, key)) continue;
      const value = query[key];
      if (value === undefined) continue;
      if (value === null) whereList.push(`${key}: null`);
      else if ((key === '$and' || key === '$or') && Array.isArray(value)) {
        const graphqlOp = key === '$and' ? '_and' : '_or';
        const items = value as QueryJson[];
        whereList.push(
          `${graphqlOp}: [${items.map((item) => `{${this.buildJsonQuery(item)}}`).join(', ')}]`,
        );
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
          if (!Object.prototype.hasOwnProperty.call(options, option)) continue;
          const optionValue = options[option];
          if (option.startsWith('$')) {
            let realOperator = option.slice(1);
            if (realOperator === 'end_with_nocase') realOperator = 'ends_with_nocase';
            if (OPTION_KEYS_SET.has(realOperator)) {
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

  static buildElements(elements: Array<ElementType>): Array<string> {
    return elements.map((element) => {
      if (typeof element === 'string') return element;
      const object = element as { collection: string; params: GraphParams };
      return this.buildQuery({ collection: object.collection, params: object.params });
    });
  }

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

    const filters = new Set<string>();
    const blockFilters = new Set<string>();
    if (metadata.elements) {
      for (const filter of metadata.elements) {
        if (filter === 'deployment' || filter === 'hasIndexingErrors') {
          filters.add(filter);
        } else blockFilters.add(filter);
      }
      const blockFilterQuery = Array.from(blockFilters).join(' ');
      if (blockFilterQuery.length > 0) filters.add(`block{${blockFilterQuery}}`);
      const sFiltersQuery = Array.from(filters).join(' ');
      if (sFiltersQuery.length > 0) result += `{${sFiltersQuery}}`;
    }
    return result.length > 0 ? `_meta${result}` : '';
  }

  private static _buildInlineFragment(fragment: InlineFragmentType): string {
    const elements = fragment.params?.elements?.length
      ? this.buildElements(fragment.params.elements)
      : ['id'];
    return `... on ${fragment.collection}{${elements.join(' ')}}`;
  }

  static buildInlineFragments(fragments: Array<InlineFragmentType>): string {
    return fragments.map((fragment) => this._buildInlineFragment(fragment)).join(' ');
  }

  static buildQuery(data: GraphObject, metadata?: Metadata): string {
    const { collection, params } = data;
    const filters: Array<string> = [];

    if (params?.args && params?.where) {
      console.warn(
        '[eth-graph-query] Both `args` and `where` are set. For The Graph schemas use only `where`; for generic GraphQL use only `args`.',
      );
    }

    if (params?.id !== undefined) filters.push(`id: ${this.serializeValue(params.id)}`);
    if (params?.orderBy) filters.push(`orderBy: ${params.orderBy}`);
    if (params?.orderDirection) filters.push(`orderDirection: ${params.orderDirection}`);
    if (params?.subgraphError) filters.push(`subgraphError: ${params.subgraphError}`);
    if (params?.args) {
      const args = this.buildArgs(params.args);
      if (args.length > 0) filters.push(...args);
    }
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

  static makeFullQuery(query: string, queryName = 'query'): string {
    return `query ${queryName} {${query}}`;
  }
}
