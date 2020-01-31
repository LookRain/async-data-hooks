export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface ApiListResponse<T> {
  status: string;
  data: ApiListData<T>;
}

export interface ApiListData<T> {
  total: number;
  items: T[];
}

export interface PayloadEvent<T, P> {
  type: T;
  data: P;
}
