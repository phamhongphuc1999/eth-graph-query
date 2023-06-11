type BaseQueryType = Array<string> | string | number | boolean | undefined;

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
  'lts',
  'not',
  'in',
  'not_in',
];
export type OptionsKey =
  | 'contains'
  | 'contains_nocase'
  | 'ends_with'
  | 'end_with_nocase'
  | 'starts_with'
  | 'starts_with_nocase'
  | 'not_contains'
  | 'not_contains_nocase'
  | 'not_ends_with'
  | 'not_ends_with_nocase'
  | 'not_starts_with'
  | 'not_starts_with_nocase'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'not'
  | 'in'
  | 'not_in';

export type TextWhereOptions = {
  contains?: BaseQueryType;
  contains_nocase?: BaseQueryType;
  ends_with?: BaseQueryType;
  end_with_nocase?: BaseQueryType;
  starts_with?: BaseQueryType;
  starts_with_nocase?: BaseQueryType;
  not_contains?: BaseQueryType;
  not_contains_nocase?: BaseQueryType;
  not_ends_with?: BaseQueryType;
  not_ends_with_nocase?: BaseQueryType;
  not_starts_with?: BaseQueryType;
  not_starts_with_nocase?: BaseQueryType;
};

export type CommonWhereOptions = {
  gt?: BaseQueryType;
  gte?: BaseQueryType;
  lt?: BaseQueryType;
  lte?: BaseQueryType;
  not?: BaseQueryType;
  in?: BaseQueryType;
  not_in?: BaseQueryType;
};

export type WhereOptions = TextWhereOptions & CommonWhereOptions;

export type QueryJson = { [key: string]: QueryJson | WhereOptions | BaseQueryType };
export type BlockQuery = { hash?: string; number?: number; number_gte?: number };
export type ElementType = string | { collection: string; params?: GraphParams };

export interface GraphParams {
  elements?: Array<ElementType>;
  where?: QueryJson;
  id?: string;
  first?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  skip?: number;
  subgraphError?: 'allow' | 'deny';
  block?: BlockQuery;
}
