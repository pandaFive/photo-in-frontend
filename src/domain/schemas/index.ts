/**
 * zodスキーマ定義
 * CODE-001: APIレスポンスのランタイムバリデーション用
 */

import { z } from 'zod';

// Task型スキーマ
export const TaskSchema = z.object({
  id: z.number(),
  task_title: z.string(),
  area_name: z.string(),
  history_id: z.number(),
  assign_cycle_id: z.number(),
  created_at: z.string(),
});

export const TaskArraySchema = z.array(TaskSchema);

// Comment型スキーマ
export const CommentSchema = z.object({
  id: z.number(),
  name: z.string(),
  content: z.string(),
  taskId: z.number(),
  updatedAt: z.string(),
  accountName: z.string(),
  role: z.string(),
});

export const CommentArraySchema = z.array(CommentSchema);

// AccountData型スキーマ
export const AccountDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  area: z.array(z.string()),
  role: z.string(),
  token: z.string(),
});

// Area型スキーマ
export const AreaSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const AreaArraySchema = z.array(AreaSchema);

// MemberStatus型スキーマ
export const MemberStatusSchema = z.object({
  id: z.number(),
  capacity: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  area: z.array(z.string()),
  total: z.number(),
  week: z.number(),
  ng_rate: z.number(),
  assign: z.number(),
});

export const MemberStatusArraySchema = z.array(MemberStatusSchema);

// ErrorResponse型スキーマ
export const ErrorResponseSchema = z.object({
  errors: z.array(z.string()),
});

// WeekCompleteData型スキーマ
export const WeekCompleteDataSchema = z.record(z.string(), z.number());

// 型推論用エクスポート
export type TaskSchemaType = z.infer<typeof TaskSchema>;
export type CommentSchemaType = z.infer<typeof CommentSchema>;
export type AccountDataSchemaType = z.infer<typeof AccountDataSchema>;
export type AreaSchemaType = z.infer<typeof AreaSchema>;
export type MemberStatusSchemaType = z.infer<typeof MemberStatusSchema>;
export type ErrorResponseSchemaType = z.infer<typeof ErrorResponseSchema>;
export type WeekCompleteDataSchemaType = z.infer<typeof WeekCompleteDataSchema>;
