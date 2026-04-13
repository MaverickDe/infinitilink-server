import { ITransfer } from "./models/Transactions"
import { IUser } from "./models/user";
export interface IPagination {
 
  nextPage:number
  limit?: number;
  total?: number;
 
 
  totalPages?: number;
  perPage?:number
}

export interface IPagResponse {
    data: any[];
    total: number;
    currentPage: number;
    perPage?: number;
     hasMore: boolean;
    nextPage: number;
}

export interface IPagobject extends IPagination {
 
  user?: string|IUser;
 
  sort?: string;
  nextPage:number

  order?: 'asc' | 'desc';
}



