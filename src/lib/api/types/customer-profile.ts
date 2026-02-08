export interface CustomerList {
  id: string;
  name: string;
  systemName: string | null;
  description: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerListRequest {
  name: string;
  description?: string;
}
