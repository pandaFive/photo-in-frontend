import {
  convertApiCommentToComment,
  convertApiCommentsToComments,
} from '@/src/domain/functions/converters';
import { CommentApiResponse } from '@/src/types/api-responses';

describe('converters', () => {
  describe('convertApiCommentToComment', () => {
    // 正常系: 全フィールドが揃っている場合
    test('正常なAPIレスポンスをComment型に変換できる', () => {
      const apiComment: CommentApiResponse = {
        id: 1,
        content: 'テストコメント',
        task_id: 10,
        account_id: 5,
        account_name: '山田太郎',
        account_role: 'admin',
        updated_at: '2025-12-31T12:00:00.000Z',
      };

      const result = convertApiCommentToComment(apiComment);

      expect(result).toEqual({
        id: 1,
        name: '山田太郎',
        content: 'テストコメント',
        taskId: 10,
        updatedAt: '2025-12-31T12:00:00.000Z',
        accountName: '山田太郎',
        role: 'admin',
      });
    });

    // null値のハンドリング: account_nameがnullの場合
    test('account_nameがnullの場合、デフォルト値「不明なユーザー」を設定', () => {
      const apiComment: CommentApiResponse = {
        id: 1,
        content: 'テストコメント',
        task_id: 10,
        account_id: 5,
        account_name: null,
        account_role: 'member',
        updated_at: '2025-12-31T12:00:00.000Z',
      };

      const result = convertApiCommentToComment(apiComment);

      expect(result.name).toBe('不明なユーザー');
      expect(result.accountName).toBe('不明なユーザー');
    });

    // null値のハンドリング: account_roleがnullの場合
    test('account_roleがnullの場合、デフォルト値「member」を設定', () => {
      const apiComment: CommentApiResponse = {
        id: 1,
        content: 'テストコメント',
        task_id: 10,
        account_id: 5,
        account_name: '山田太郎',
        account_role: null,
        updated_at: '2025-12-31T12:00:00.000Z',
      };

      const result = convertApiCommentToComment(apiComment);

      expect(result.role).toBe('member');
    });

    // 両方がnullの場合
    test('account_nameとaccount_role両方がnullの場合、両方にデフォルト値を設定', () => {
      const apiComment: CommentApiResponse = {
        id: 1,
        content: 'テストコメント',
        task_id: 10,
        account_id: 5,
        account_name: null,
        account_role: null,
        updated_at: '2025-12-31T12:00:00.000Z',
      };

      const result = convertApiCommentToComment(apiComment);

      expect(result.name).toBe('不明なユーザー');
      expect(result.accountName).toBe('不明なユーザー');
      expect(result.role).toBe('member');
    });

    // 異なるロールの変換
    test('memberロールを正しく変換', () => {
      const apiComment: CommentApiResponse = {
        id: 2,
        content: 'メンバーコメント',
        task_id: 20,
        account_id: 10,
        account_name: '田中花子',
        account_role: 'member',
        updated_at: '2025-12-30T10:00:00.000Z',
      };

      const result = convertApiCommentToComment(apiComment);

      expect(result.role).toBe('member');
    });
  });

  describe('convertApiCommentsToComments', () => {
    // 複数コメントの変換
    test('複数のAPIレスポンスを正しく変換できる', () => {
      const apiComments: CommentApiResponse[] = [
        {
          id: 1,
          content: 'コメント1',
          task_id: 10,
          account_id: 5,
          account_name: 'ユーザー1',
          account_role: 'admin',
          updated_at: '2025-12-31T12:00:00.000Z',
        },
        {
          id: 2,
          content: 'コメント2',
          task_id: 20,
          account_id: 6,
          account_name: 'ユーザー2',
          account_role: 'member',
          updated_at: '2025-12-31T13:00:00.000Z',
        },
      ];

      const result = convertApiCommentsToComments(apiComments);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].taskId).toBe(10);
      expect(result[0].name).toBe('ユーザー1');
      expect(result[1].id).toBe(2);
      expect(result[1].taskId).toBe(20);
      expect(result[1].name).toBe('ユーザー2');
    });

    // 空配列のハンドリング
    test('空配列を正しく変換できる', () => {
      const result = convertApiCommentsToComments([]);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    // null値を含むコメントの配列変換
    test('null値を含むコメント配列を正しく変換できる', () => {
      const apiComments: CommentApiResponse[] = [
        {
          id: 1,
          content: 'コメント1',
          task_id: 10,
          account_id: 5,
          account_name: null,
          account_role: null,
          updated_at: '2025-12-31T12:00:00.000Z',
        },
        {
          id: 2,
          content: 'コメント2',
          task_id: 20,
          account_id: 6,
          account_name: 'ユーザー2',
          account_role: 'admin',
          updated_at: '2025-12-31T13:00:00.000Z',
        },
      ];

      const result = convertApiCommentsToComments(apiComments);

      expect(result[0].name).toBe('不明なユーザー');
      expect(result[0].role).toBe('member');
      expect(result[1].name).toBe('ユーザー2');
      expect(result[1].role).toBe('admin');
    });
  });
});
