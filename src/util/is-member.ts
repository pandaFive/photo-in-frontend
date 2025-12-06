import { AccountData } from '../types';

/**
 * アカウントがメンバー権限を持つか確認する
 * @param account - 確認するアカウントデータ（nullの場合はfalseを返す）
 * @returns メンバーの場合true、それ以外（管理者またはnull）はfalse
 */
export const isMember = (account: AccountData | null): boolean => {
  return account?.role === 'member' ?? false;
};
