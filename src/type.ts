/**
 * Base types that can be used in query filters.
 */
export type BaseQueryType =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | null
  | undefined;

/**
 * Valid operator suffixes for The Graph queries (e.g., _gt, _in, _contains).
 */
export const OptionKeys = [
  'contains',
  'contains_nocase',
  'ends_with',
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
] as const;

/**
 * Type representing the valid operator keys.
 */
export type OptionKey = (typeof OptionKeys)[number];

/**
 * Filter options for text-based fields.
 */
export type TextWhereOptions = {
  /** Matches values containing the substring. */
  $contains?: BaseQueryType;
  /** Case-insensitive contains. */
  $contains_nocase?: BaseQueryType;
  /** Matches values ending with the substring. */
  $ends_with?: BaseQueryType;
  /** Case-insensitive ends_with. */
  $end_with_nocase?: BaseQueryType;
  /** Matches values starting with the substring. */
  $starts_with?: BaseQueryType;
  /** Case-insensitive starts_with. */
  $starts_with_nocase?: BaseQueryType;
  /** Matches values NOT containing the substring. */
  $not_contains?: BaseQueryType;
  /** Case-insensitive not_contains. */
  $not_contains_nocase?: BaseQueryType;
  /** Matches values NOT ending with the substring. */
  $not_ends_with?: BaseQueryType;
  /** Case-insensitive not_ends_with. */
  $not_ends_with_nocase?: BaseQueryType;
  /** Matches values NOT starting with the substring. */
  $not_starts_with?: BaseQueryType;
  /** Case-insensitive not_starts_with. */
  $not_starts_with_nocase?: BaseQueryType;
};

/**
 * Common filter options for all field types.
 */
export type CommonWhereOptions = {
  /** Greater than. */
  $gt?: BaseQueryType;
  /** Greater than or equal to. */
  $gte?: BaseQueryType;
  /** Less than. */
  $lt?: BaseQueryType;
  /** Less than or equal to. */
  $lte?: BaseQueryType;
  /** Not equal to. */
  $not?: BaseQueryType;
  /** Included in the provided array. */
  $in?: BaseQueryType;
  /** Not included in the provided array. */
  $not_in?: BaseQueryType;
};

/**
 * Combined filter options for a field.
 */
export type WhereOptions = TextWhereOptions & CommonWhereOptions;

/**
 * JSON structure representing the 'where' filter in a query.
 * Keys are field names, and values can be primitive values or WhereOptions.
 */
export type QueryJson = { [key: string]: QueryJson | WhereOptions | BaseQueryType };

/**
 * Filter for querying data at a specific block.
 */
export type BlockQuery = {
  /** Filter by block hash. */
  hash?: string;
  /** Filter by exact block number. */
  number?: number;
  /** Filter by blocks with number greater than or equal to. */
  number_gte?: number;
};

/**
 * Metadata fields to query from the subgraph (_meta).
 */
export type Metadata = {
  /** Specific metadata elements to fetch. */
  elements?: Array<'deployment' | 'hasIndexingErrors' | 'hash' | 'number' | 'timestamp'>;
  /** Query metadata for a specific block. */
  blockQuery?: BlockQuery;
};

/**
 * Represents a field in a query. Can be a simple string (field name)
 * or a GraphObject for nested collection queries.
 */
export type ElementType = string | GraphObject;

/**
 * Represents an inline fragment for polymorphic types.
 */
export type InlineFragmentType = {
  /** The collection name for the fragment (e.g., 'User'). */
  collection: string;
  /** Fields to select within the fragment. */
  params?: Pick<GraphParams, 'elements'>;
};

/**
 * Parameters for a collection query.
 */
export interface GraphParams {
  /** Fields to select from the collection. */
  elements?: Array<ElementType>;
  /** Inline fragments for selecting fields on specific types. */
  inlineFragments?: Array<InlineFragmentType>;
  /** Filter conditions for the query. */
  where?: QueryJson;
  /** Filter by specific entity ID (shortcut for where: { id: ... }). */
  id?: string;
  /** Number of items to return (max 1000). */
  first?: number;
  /** Field to sort the results by. */
  orderBy?: string;
  /** Direction of the sort (asc or desc). */
  orderDirection?: 'asc' | 'desc';
  /** Number of items to skip (max 5000). */
  skip?: number;
  /** Re-run the query even if the subgraph has indexing errors. */
  subgraphError?: 'allow' | 'deny';
  /** Query the collection state at a specific block. */
  block?: BlockQuery;
}

/**
 * Configuration for a query against a specific collection.
 */
export interface GraphObject {
  /** The name of the collection to query (e.g., 'users'). */
  collection: string;
  /** Optional parameters for filtering, sorting, and pagination. */
  params?: GraphParams;
}

/**
 * Error structure returned by The Graph API.
 */
export type ErrorObject = {
  /** List of errors encountered during query execution. */
  errors: Array<{ message: string; locations: Array<unknown> }>;
};
