import { isAdmin } from '@/src/util/is-admin';
import { AccountData } from '@/src/types';

describe('isAdmin function', () => {
  it('アカウントがnullの場合はfalseを返す', () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('アカウントのroleが"admin"でない場合はfalseを返す', () => {
    const nonAdminAccount: AccountData = {
      role: 'user',
      name: '',
      area: [],
      id: 1,
      token: '',
    };
    expect(isAdmin(nonAdminAccount)).toBe(false);
  });

  it('アカウントのroleが"admin"の場合はtrueを返す', () => {
    const adminAccount: AccountData = {
      role: 'admin',
      name: '',
      area: [],
      id: 1,
      token: '',
    };
    expect(isAdmin(adminAccount)).toBe(true);
  });
});
