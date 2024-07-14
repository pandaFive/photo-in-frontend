export type Task = {
  id: number;
  title: string;
  area_name: string;
  history_id: number;
  assign_cycle_id: number;
  created_at: string;
};

export type Comment = {
  id: number;
  name: string;
  content: string;
  taskId: number;
  updatedAt: string;
  accountName: string;
  role: string;
};

export type AccountData = {
  id: number;
  name: string;
  area: string[];
  role: string;
  token: string;
};

export type Area = {
  id: number;
  name: string;
};

export type MemberStatus = {
  id: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  area: string[];
  total: number;
  week: number;
  ng_rate: number;
  assign: number;
};

export type ResponseStatus = {
  [key: string]: string;
};
