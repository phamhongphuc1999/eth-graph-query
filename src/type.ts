export type QueryJson = { [key: string]: QueryJson | string | number | boolean | undefined };
export type BlockQuery = { hash?: string; number?: number; number_gte?: number };

export interface GraphParams {
  elements: Array<string>;
  where?: QueryJson;
  id?: string;
  first?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  skip?: number;
  subgraphError?: 'allow' | 'deny';
  block?: BlockQuery;
}
