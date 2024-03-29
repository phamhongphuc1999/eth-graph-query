type BaseQueryType =
  | Array<string | number | boolean>
  | string
  | number
  | boolean
  | null
  | undefined;

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
];

export type TextWhereOptions = {
  $contains?: BaseQueryType;
  $contains_nocase?: BaseQueryType;
  $ends_with?: BaseQueryType;
  $end_with_nocase?: BaseQueryType;
  $starts_with?: BaseQueryType;
  $starts_with_nocase?: BaseQueryType;
  $not_contains?: BaseQueryType;
  $not_contains_nocase?: BaseQueryType;
  $not_ends_with?: BaseQueryType;
  $not_ends_with_nocase?: BaseQueryType;
  $not_starts_with?: BaseQueryType;
  $not_starts_with_nocase?: BaseQueryType;
};

export type CommonWhereOptions = {
  $gt?: BaseQueryType;
  $gte?: BaseQueryType;
  $lt?: BaseQueryType;
  $lte?: BaseQueryType;
  $not?: BaseQueryType;
  $in?: BaseQueryType;
  $not_in?: BaseQueryType;
};

export type WhereOptions = TextWhereOptions & CommonWhereOptions;

export type QueryJson = { [key: string]: QueryJson | WhereOptions | BaseQueryType };
export type BlockQuery = { hash?: string; number?: number; number_gte?: number };

export type Metadata = {
  elements?: Array<'deployment' | 'hasIndexingErrors' | 'hash' | 'number' | 'timestamp'>;
  blockQuery?: BlockQuery;
};

export type ElementType = string | GraphObject;
export type InlineFragmentType = { collection: string; params?: Pick<GraphParams, 'elements'> };

export interface GraphParams {
  elements?: Array<ElementType>;
  inlineFragments?: Array<InlineFragmentType>;
  where?: QueryJson;
  id?: string;
  first?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  skip?: number;
  subgraphError?: 'allow' | 'deny';
  block?: BlockQuery;
}

export interface GraphObject {
  collection: string;
  params?: GraphParams;
}

export type ErrorObject = {
  errors: Array<{ message: string; locations: Array<unknown> }>;
};
