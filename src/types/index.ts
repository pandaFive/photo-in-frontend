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
  content: string;
  cycleId: number;
  updatedAt: string;
  accountName: string;
  role: string;
};
