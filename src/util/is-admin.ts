import { AccountData } from '../types';

/**
 * アカウントが管理者権限を持つか確認する
 * @param account - 確認するアカウントデータ（nullの場合はfalseを返す）
 * @returns 管理者の場合true、それ以外はfalse
 */
export const isAdmin = (account: AccountData | null): boolean => {
  return account?.role === 'admin' ?? false;
};
